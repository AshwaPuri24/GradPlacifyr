import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  FilePenLine,
  Search,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getJobs, type Job } from '../../api/jobs'
import { getMyApplications, type StudentApplication } from '../../api/applications'
import { getMyProfile, type StudentProfile } from '../../api/profile'
import { API_BASE } from '../../config'
import {
  EventCalendar,
  JobOpportunityCard,
  WorkflowCard,
  type JobCardData,
} from '../../components/dashboard'
import './StudentDashboardHome.css'

// ── Profile score helpers (unchanged) ───────────────────────────────────────

function scoreProfile(profile: StudentProfile) {
  const checks = [
    profile.tenthPercentage !== null,
    profile.twelfthPercentage !== null,
    profile.graduationYear !== null,
    Boolean(profile.programmingLanguages.trim()),
    Boolean(profile.frameworks.trim()),
    Boolean(profile.tools.trim()),
    Boolean(profile.certifications.trim()),
    profile.projects.length > 0,
    Boolean(profile.internshipExperience.trim()),
    Boolean(profile.achievements.trim()),
    Boolean(profile.githubUrl.trim() || profile.linkedinUrl.trim() || profile.portfolioUrl.trim()),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function readinessLabel(score: number) {
  if (score < 40) return 'Weak'
  if (score < 65) return 'Medium'
  if (score < 85) return 'Strong'
  return 'Placement Ready'
}

// ── Profile Score Gauge ──────────────────────────────────────────────────────

const ProfileScoreGauge = ({ score }: { score: number }) => {
  const SIZE = 124
  const STROKE = 10
  const radius = (SIZE - STROKE) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const label = score >= 85 ? 'Excellent' : score >= 65 ? 'Good' : score >= 40 ? 'Average' : 'Needs Work'

  return (
    <div className="sdb-gauge">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={radius}
          fill="none" stroke="url(#gaugeGrad)" strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="sdb-gauge-inner">
        <strong>{score}%</strong>
        <span>Profile Score</span>
        <em>{label}</em>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

const StudentDashboardHome = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<StudentApplication[]>([])
  const [profile, setProfile] = useState<StudentProfile | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)

    Promise.allSettled([getJobs(), getMyApplications(), getMyProfile()])
      .then(([jobsRes, appsRes, profileRes]) => {
        if (cancelled) return
        if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value)
        if (appsRes.status === 'fulfilled') setApplications(appsRes.value)
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value)

        const failures = [jobsRes, appsRes, profileRes].filter(
          (r): r is PromiseRejectedResult => r.status === 'rejected'
        )
        if (failures.length === 3) {
          const raw = failures[0].reason instanceof Error
            ? failures[0].reason.message
            : 'Failed to load dashboard data'
          setError(
            raw === 'Failed to fetch'
              ? 'Cannot reach the placement API. Please check that the backend server is running.'
              : raw
          )
        } else if (failures.length > 0) {
          console.warn('[dashboard] Partial load failure:', failures.map((f) => f.reason))
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  // ── Derived stats (all unchanged) ────────────────────────────────────────

  const openJobs = useMemo(() => jobs.filter((j) => j.status === 'open'), [jobs])

  const appliedJobIds = useMemo(
    () => new Set(applications.map((a) => a.jobId)),
    [applications]
  )

  const shortlistedCount = useMemo(
    () => applications.filter((a) =>
      ['shortlisted', 'test_scheduled', 'interview_scheduled', 'selected'].includes(a.status)
    ).length,
    [applications]
  )

  const interviewCount = useMemo(
    () => applications.filter((a) =>
      ['test_scheduled', 'interview_scheduled'].includes(a.status)
    ).length,
    [applications]
  )

  const profileCompletion = useMemo(() => (profile ? scoreProfile(profile) : 0), [profile])

  const readinessScore = useMemo(() => {
    const appFactor = applications.length ? Math.min(20, applications.length * 2) : 0
    const shortListFactor = applications.length
      ? Math.round((shortlistedCount / applications.length) * 20)
      : 0
    return Math.min(100, profileCompletion + appFactor + shortListFactor)
  }, [applications.length, shortlistedCount, profileCompletion])

  const offerCount = useMemo(
    () => applications.filter((a) => a.status === 'selected').length,
    [applications]
  )

  const nextInterview = useMemo(
    () => applications.find((a) => a.status === 'interview_scheduled') ?? null,
    [applications]
  )

  const nearestDeadline = useMemo(() => {
    const today = new Date()
    const future = openJobs
      .filter((j) => j.deadline && new Date(j.deadline) >= today)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    return future[0] ?? null
  }, [openJobs])

  const jobCards = useMemo<JobCardData[]>(() => {
    const cards: JobCardData[] = openJobs.slice(0, 4).map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      ctc: job.ctc,
      location: job.location,
      deadline: job.deadline,
      employmentType: job.employmentType,
      status: appliedJobIds.has(job.id) ? 'applied' as const : 'open' as const,
    }))

    if (cards.length < 4) {
      const openIds = new Set(cards.map((c) => c.id))
      const appliedJobs = jobs
        .filter((j) => appliedJobIds.has(j.id) && !openIds.has(j.id))
        .slice(0, 4 - cards.length)
      for (const job of appliedJobs) {
        cards.push({
          id: job.id, title: job.title, company: job.company,
          ctc: job.ctc, location: job.location, deadline: job.deadline,
          employmentType: job.employmentType, status: 'applied',
        })
      }
    }
    return cards
  }, [openJobs, jobs, appliedJobIds])

  // ── SSO: launch AI MCQ practice ──────────────────────────────────────────

  const handleAiMockInterview = async () => {
    try {
      const res = await fetch(`${API_BASE}/sso/generate-ticket`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('SSO ticket generation failed:', body)
        return
      }
      const { redirectUrl } = await res.json()
      window.location.href = redirectUrl
    } catch (err) {
      console.error('Failed to launch AI practice session:', err)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="sdb">
      {/* Error */}
      {error && <div className="sdb-error">{error}</div>}

      {/* ══ HERO ══ */}
      <section className="sdb-hero">
        {/* ── Left: greeting + readiness ── */}
        <div className="sdb-hero-left">
          <h1 className="sdb-hero-greeting">Welcome back, {user?.name ?? 'Student'} 👋</h1>
          <p className="sdb-hero-sub">
            Track opportunities, monitor your funnel &amp; improve your placement readiness.
          </p>
          <div className="sdb-readiness-badge">
            <span className="sdb-readiness-dot" />
            Placement Readiness: {readinessLabel(readinessScore)}
          </div>
          <div className="sdb-hero-progress-row">
            <div className="sdb-hero-progress-bar">
              <div className="sdb-hero-progress-fill" style={{ width: `${readinessScore}%` }} />
            </div>
            <span className="sdb-hero-progress-label">{readinessScore}%</span>
          </div>
        </div>

        {/* ── Centre: 4 metric cards in one row ── */}
        <div className="sdb-hero-metrics">
          <div className="sdb-metric-card">
            <div className="sdb-metric-icon sdb-metric-icon--blue"><ClipboardList size={16} /></div>
            <strong className="sdb-metric-num">{loading ? '—' : applications.length}</strong>
            <span className="sdb-metric-lbl">Applications</span>
            <em className="sdb-metric-trend"><TrendingUp size={10} /> This month</em>
          </div>
          <div className="sdb-metric-card">
            <div className="sdb-metric-icon sdb-metric-icon--green"><UserCheck size={16} /></div>
            <strong className="sdb-metric-num">{loading ? '—' : shortlistedCount}</strong>
            <span className="sdb-metric-lbl">Shortlisted</span>
            <em className="sdb-metric-trend"><TrendingUp size={10} /> This month</em>
          </div>
          <div className="sdb-metric-card">
            <div className="sdb-metric-icon sdb-metric-icon--amber"><CalendarClock size={16} /></div>
            <strong className="sdb-metric-num">{loading ? '—' : interviewCount}</strong>
            <span className="sdb-metric-lbl">Interviews</span>
            <em className="sdb-metric-trend"><TrendingUp size={10} /> This month</em>
          </div>
          <div className="sdb-metric-card">
            <div className="sdb-metric-icon sdb-metric-icon--purple"><Trophy size={16} /></div>
            <strong className="sdb-metric-num">{loading ? '—' : offerCount}</strong>
            <span className="sdb-metric-lbl">Offers</span>
            <em className="sdb-metric-trend"><TrendingUp size={10} /> This month</em>
          </div>
        </div>

        {/* ── Right: profile score gauge ── */}
        <ProfileScoreGauge score={profileCompletion} />

        {/* ── Bottom strip: next interview + upcoming deadline ── */}
        <div className="sdb-hero-bottom">
          <div className="sdb-hero-info-panel">
            <div className="sdb-hip-icon sdb-hip-icon--blue"><CalendarClock size={15} /></div>
            <div className="sdb-hip-body">
              <span className="sdb-hip-label">Next Interview</span>
              <strong className="sdb-hip-title">
                {nextInterview
                  ? `${nextInterview.jobTitle} · ${nextInterview.company}`
                  : 'No upcoming interview'}
              </strong>
              {nextInterview && (
                <span className="sdb-hip-date">Scheduled · Check your calendar</span>
              )}
            </div>
            <Link to="/student/interview-schedule" className="sdb-hip-cta">View Schedule →</Link>
          </div>

          <div className="sdb-hero-info-panel">
            <div className="sdb-hip-icon sdb-hip-icon--amber"><CalendarClock size={15} /></div>
            <div className="sdb-hip-body">
              <span className="sdb-hip-label">Upcoming Deadline</span>
              <strong className="sdb-hip-title">
                {nearestDeadline
                  ? `${nearestDeadline.title} · ${nearestDeadline.company}`
                  : 'No deadlines soon'}
              </strong>
              {nearestDeadline && (
                <span className="sdb-hip-date">
                  {new Date(nearestDeadline.deadline!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
            <Link to="/student/jobs" className="sdb-hip-cta">View Schedule →</Link>
          </div>
        </div>
      </section>

      {/* ══ WORKFLOW CARDS ══ */}
      <div className="workflow-cards-grid">
        <WorkflowCard
          to="/student/jobs"
          title="Browse Jobs"
          subtitle="Explore all open opportunities"
          icon={Search}
          color="blue"
        />
        <WorkflowCard
          to="/student/profile"
          title="Update Profile"
          subtitle="Keep academics and skills fresh"
          icon={FilePenLine}
          color="indigo"
        />
        <WorkflowCard
          to="/student/upload-resume"
          title="Upload Resume"
          subtitle="Share latest CV with recruiters"
          icon={Upload}
          color="teal"
        />
        <WorkflowCard
          to="/student/interview-schedule"
          title="Interview Schedule"
          subtitle="Track tests and interview slots"
          icon={CalendarClock}
          color="amber"
        />
        <WorkflowCard
          to="/student/dashboard?tool=ai"
          title="AI Mock Interview"
          subtitle="Practice role-based questions"
          icon={Sparkles}
          color="purple"
          onClick={handleAiMockInterview}
        />
        <WorkflowCard
          to="/student/profile"
          title="Placement Readiness"
          subtitle="Track your placement readiness"
          icon={Target}
          color="cyan"
        />
      </div>

      {/* ══ MAIN CONTENT GRID ══ */}
      <div className="sdb-main-grid">
        {/* Left: Recommended Opportunities */}
        <div className="sdb-card sdb-jobs-section">
          <div className="sdb-section-head">
            <div className="sdb-section-title">
              <div className="sdb-section-icon"><Briefcase size={16} /></div>
              <div>
                <h2>Recommended Opportunities</h2>
                <p>Top picks based on your profile</p>
              </div>
            </div>
            <Link to="/student/jobs" className="sdb-view-all">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="sdb-jobs-scroll">
            {jobCards.length > 0 ? (
              jobCards.map((job) => <JobOpportunityCard key={job.id} job={job} />)
            ) : loading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton-block"
                  style={{ height: 110, borderRadius: '0.85rem' }}
                />
              ))
            ) : (
              <p className="sdb-empty">No open opportunities at the moment. Check back soon!</p>
            )}
          </div>
        </div>

        {/* Right: Calendar & Events */}
        <div className="sdb-calendar-section">
          <EventCalendar />
        </div>
      </div>

      {/* ══ PLACEMENT PIPELINE + AI CAREER ASSISTANT ══ */}
      <div className="sdb-bottom-grid">
        {/* Left: Placement Pipeline */}
        <div className="sdb-card sdb-pipeline">
          <h2 className="sdb-pipeline-title">Placement Pipeline</h2>
          <p className="sdb-pipeline-subtitle">Track your progress in the placement journey</p>
          {(() => {
            const active = offerCount > 0 ? 'offer'
              : interviewCount > 0 ? 'interview'
              : shortlistedCount > 0 ? 'shortlisted'
              : applications.length > 0 ? 'applied'
              : null
            return (
              <div className="sdb-pipeline-flow">
                <div className={`sdb-pf-stage sdb-pf-stage--blue${active === 'applied' ? ' sdb-pf-stage--active' : ''}`}>
                  <div className="sdb-pf-node"><Send size={22} /></div>
                  <span className="sdb-pf-label">Applied</span>
                  <strong className="sdb-pf-count">{loading ? '—' : applications.length}</strong>
                  <span className="sdb-pf-status">Total Applied</span>
                </div>
                <div className="sdb-pf-connector" />
                <div className={`sdb-pf-stage sdb-pf-stage--pink${active === 'shortlisted' ? ' sdb-pf-stage--active' : ''}`}>
                  <div className="sdb-pf-node"><Users size={22} /></div>
                  <span className="sdb-pf-label">Shortlisted</span>
                  <strong className="sdb-pf-count">{loading ? '—' : shortlistedCount}</strong>
                  <span className="sdb-pf-status">In Review</span>
                </div>
                <div className="sdb-pf-connector" />
                <div className={`sdb-pf-stage sdb-pf-stage--purple${active === 'interview' ? ' sdb-pf-stage--active' : ''}`}>
                  <div className="sdb-pf-node"><CalendarClock size={22} /></div>
                  <span className="sdb-pf-label">Interview</span>
                  <strong className="sdb-pf-count">{loading ? '—' : interviewCount}</strong>
                  <span className="sdb-pf-status">Upcoming</span>
                </div>
                <div className="sdb-pf-connector" />
                <div className={`sdb-pf-stage sdb-pf-stage--green${active === 'offer' ? ' sdb-pf-stage--active' : ''}`}>
                  <div className="sdb-pf-node"><Trophy size={22} /></div>
                  <span className="sdb-pf-label">Offer</span>
                  <strong className="sdb-pf-count">{loading ? '—' : offerCount}</strong>
                  <span className="sdb-pf-status">Offers Received</span>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Right: AI Career Assistant */}
        <div className="sdb-card sdb-ai-panel">
          <div className="sdb-section-head">
            <div className="sdb-section-title">
              <div className="sdb-section-icon sdb-section-icon--ai"><Sparkles size={16} /></div>
              <div>
                <h2>AI Career Assistant <span className="sdb-new-badge">New</span></h2>
                <p>Get personalized insights to boost your placement chances</p>
              </div>
            </div>
          </div>
          <div className="sdb-ai-cards">
            <div className="sdb-ai-card sdb-ai-card--accent-blue">
              <div className="sdb-ai-card-content">
                <strong>Improve your DSA skills</strong>
                <p>Top maintainers suggest DSA proficiency for your target roles</p>
              </div>
              <ChevronRight size={16} className="sdb-ai-card-arrow" />
            </div>
            <div className="sdb-ai-card sdb-ai-card--accent">
              <div className="sdb-ai-card-content">
                <strong>Resume Score: {profileCompletion}/100</strong>
                <p>
                  {profileCompletion < 65
                    ? 'Your resume score is low — improvements suggested'
                    : 'Your resume looks good! Keep updating your profile'}
                </p>
              </div>
              <ChevronRight size={16} className="sdb-ai-card-arrow" />
            </div>
          </div>
          <button className="sdb-ai-explore" onClick={handleAiMockInterview}>
            Explore AI Insights <ArrowRight size={14} />
          </button>
        </div>
      </div>


    </div>
  )
}

export default StudentDashboardHome
