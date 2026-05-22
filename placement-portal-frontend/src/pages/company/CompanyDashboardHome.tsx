import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  FileBarChart,
  ChevronRight,
  TrendingUp,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Mail,
  Building2,
  Activity,
  BarChart3,
  PlusCircle,
  ClipboardPen,
  FileUser,
  ListChecks,
  ChevronDown,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getJobs, type Job } from '../../api/jobs'
import { getApplications, type PortalApplication } from '../../api/applications'
import { getRoleTheme } from '../../utils/roleConfig'
import {
  ActivityTimeline,
  DashboardLayout,
  EventCalendar,
  WorkflowCard,
  type TimelineItem,
} from '../../components/dashboard'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CompanyDashboardHome = () => {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<PortalApplication[]>([])

  useEffect(() => {
    Promise.all([getJobs(), getApplications()])
      .then(([jobRows, appRows]) => {
        setJobs(jobRows)
        setApplications(appRows)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load company dashboard data'
        setError(message)
      })
  }, [])

  // ── Derived metrics ──

  const openJobs = useMemo(() => jobs.filter((j) => j.status === 'open').length, [jobs])
  const totalJobs = jobs.length

  const shortlistedCount = useMemo(
    () => applications.filter((a) => ['shortlisted', 'test_scheduled', 'interview_scheduled'].includes(a.status)).length,
    [applications]
  )

  const selectedCount = useMemo(
    () => applications.filter((a) => a.status === 'selected').length,
    [applications]
  )

  const conversionRate = useMemo(() => {
    if (!applications.length) return 0
    return Math.round((selectedCount / applications.length) * 100)
  }, [applications.length, selectedCount])

  const interviewsScheduled = useMemo(
    () => applications.filter((a) => ['test_scheduled', 'interview_scheduled'].includes(a.status)).length,
    [applications]
  )

  const pendingReview = useMemo(
    () => applications.filter((a) => a.status === 'applied').length,
    [applications]
  )

  // ── Chart data ──

  const hiringStatsData = useMemo(() => {
    const pending = applications.filter((a) => a.status === 'applied').length
    const inProgress = applications.filter((a) => ['shortlisted', 'test_scheduled', 'interview_scheduled'].includes(a.status)).length
    return [
      { name: 'Selected', value: selectedCount },
      { name: 'In Progress', value: inProgress },
      { name: 'Pending', value: pending },
    ]
  }, [applications, selectedCount])

  const trendData = useMemo(() => {
    const monthMap = new Map<string, number>()
    for (const app of applications) {
      const dt = new Date(app.appliedAt)
      const key = `${MONTH_SHORT[dt.getMonth()]} ${String(dt.getFullYear()).slice(2)}`
      monthMap.set(key, (monthMap.get(key) || 0) + 1)
    }
    return Array.from(monthMap.entries()).map(([month, applicants]) => ({ month, applicants }))
  }, [applications])

  const jobDistribution = useMemo(() => {
    const byJob = new Map<string, number>()
    for (const app of applications) {
      byJob.set(app.jobTitle, (byJob.get(app.jobTitle) || 0) + 1)
    }
    return Array.from(byJob.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([job, count]) => ({ job, students: count, hired: Math.round(count * 0.15) }))
  }, [applications])

  // ── Activity timeline ──

  const activityItems = useMemo<TimelineItem[]>(
    () =>
      applications.slice(0, 6).map((item) => ({
        id: item.id,
        title: `${item.studentName || item.studentEmail} - ${item.jobTitle}`,
        description: `${item.company} updated to ${item.status}`,
        time: new Date(item.appliedAt).toLocaleDateString(),
        tone: item.status === 'selected' ? 'success' : item.status.includes('interview') ? 'warning' : 'default',
      })),
    [applications]
  )

  // ── Filter state ──
  const [filterMode, setFilterMode] = useState<'month' | 'company'>('month')
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // ── Job list from jobs ──
  const jobList = useMemo(() => {
    const jobSet = new Set(jobs.map((j) => j.title))
    return Array.from(jobSet).sort()
  }, [jobs])

  // ── Job-filtered metrics ──
  const jobMetrics = useMemo(() => {
    if (!selectedJob) return null

    const jobApplications = applications.filter((a) => a.jobTitle === selectedJob)
    const jobSelected = jobApplications.filter((a) => a.status === 'selected').length
    const jobShortlisted = jobApplications.filter((a) => ['shortlisted', 'test_scheduled', 'interview_scheduled'].includes(a.status)).length

    const jobConversionRate = jobApplications.length
      ? Math.round((jobSelected / jobApplications.length) * 100)
      : 0

    return {
      openJobs: 1,
      applications: jobApplications.length,
      shortlisted: jobShortlisted,
      offers: jobSelected,
      conversionRate: jobConversionRate,
    }
  }, [selectedJob, applications])

  // ── Render ──

  const roleTheme = getRoleTheme('recruiter')

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setIsDropdownOpen(false)
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isDropdownOpen])

  return (
    <DashboardLayout
      user={user ?? undefined}
      title="Company Dashboard"
      subtitle="Monitor job performance, track applicants, and accelerate hiring outcomes with live analytics."
      compactLayout
      heroGradient={roleTheme.heroGradient}
      roleIcon={roleTheme.icon}
      error={error}
      readinessLabel="Hiring Pipeline"
      heroStats={[
        { label: 'Jobs Posted', value: totalJobs },
        { label: 'Pending Review', value: pendingReview },
        { label: "Today's Interviews", value: interviewsScheduled },
        { label: 'Candidates Hired', value: selectedCount },
        { label: 'Conversion Rate', value: `${conversionRate}%` },
      ]}
      kpis={null}
      skipQuickActionsCard
      quickActions={
        <div className="workflow-cards-grid workflow-cards-6">
          <WorkflowCard
            to="/company/post-job"
            title="Post New Job"
            subtitle="Publish a job or internship opening"
            icon={PlusCircle}
            color="blue"
          />
          <WorkflowCard
            to="/company/manage-jobs"
            title="Manage Jobs"
            subtitle="Update statuses and close roles"
            icon={ClipboardPen}
            color="indigo"
          />
          <WorkflowCard
            to="/company/applicants"
            title="View Applicants"
            subtitle="Review incoming candidate profiles"
            icon={FileUser}
            color="teal"
          />
          <WorkflowCard
            to="/company/shortlist"
            title="Shortlist Candidates"
            subtitle="Move candidates to next round"
            icon={ListChecks}
            color="amber"
          />
          <WorkflowCard
            to="/company/reports"
            title="Placement Reports"
            subtitle="View analytics and reports"
            icon={BarChart3}
            color="purple"
          />
          <WorkflowCard
            to="/company/pipeline"
            title="Monitor Hiring Pipeline"
            subtitle="Track candidate progression"
            icon={Activity}
            color="cyan"
          />
        </div>
      }
      skipActivityCard
      activity={
        <div className="admin-ops-grid">
          {/* LEFT — Recent Activity */}
          <div className="admin-activity-card">
            <div className="admin-section-head">
              <div className="admin-section-title">
                <div className="admin-section-icon">
                  <Activity size={16} />
                </div>
                <div>
                  <h2>Recent Activity</h2>
                  <p>Latest applicant actions and updates</p>
                </div>
              </div>
              <Link to="/company/applicants" className="admin-view-all">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="admin-activity-scroll">
              <ActivityTimeline items={activityItems} emptyText="No recent applicant activity yet." />
            </div>
          </div>
          {/* RIGHT — Calendar */}
          <div className="admin-calendar-section">
            <EventCalendar canManage />
          </div>
        </div>
      }
      primaryContent={
        <>
          {/* Overview Section — moved directly below Activity + Calendar */}
          <section className="dashboard-section dashboard-section-overview">
            <div className="dashboard-section-head">
              <div>
                <h2>Overview — {filterMode === 'month' ? 'This Month' : selectedJob || 'All Jobs'}</h2>
                <p>Key hiring metrics</p>
              </div>
              <div className="overview-filters">
                <button
                  className={`overview-filter-btn ${filterMode === 'month' ? 'active' : ''}`}
                  onClick={() => setFilterMode('month')}
                >
                  Month Wise
                </button>
                <div className="company-dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`overview-filter-btn company-btn ${filterMode === 'company' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setFilterMode('company')
                      setIsDropdownOpen(!isDropdownOpen)
                    }}
                    aria-expanded={isDropdownOpen}
                  >
                    Job Wise
                    <ChevronDown size={14} className={`company-dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
                  </button>
                  {isDropdownOpen && filterMode === 'company' && (
                    <div className="company-dropdown-menu">
                      <div className="company-dropdown-list">
                        {jobList.map((job) => (
                          <button
                            key={job}
                            className={`company-dropdown-item ${selectedJob === job ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedJob(job)
                              setIsDropdownOpen(false)
                            }}
                            aria-selected={selectedJob === job}
                          >
                            {job}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="overview-strip">
              <div className="overview-stat">
                <div className="overview-icon overview-icon-blue">
                  <Briefcase size={18} />
                </div>
                <div className="overview-content">
                  <span className="overview-label">
                    {filterMode === 'company' && selectedJob ? selectedJob : 'Open Jobs'}
                  </span>
                  <strong className="overview-value">
                    {filterMode === 'company' && jobMetrics ? jobMetrics.openJobs : openJobs}
                  </strong>
                </div>
              </div>
              <div className="overview-stat">
                <div className="overview-icon overview-icon-indigo">
                  <FileBarChart size={18} />
                </div>
                <div className="overview-content">
                  <span className="overview-label">
                    {filterMode === 'company' && selectedJob ? 'Applications' : 'Total Applicants'}
                  </span>
                  <strong className="overview-value">
                    {filterMode === 'company' && jobMetrics ? jobMetrics.applications : applications.length}
                  </strong>
                </div>
              </div>
              <div className="overview-stat">
                <div className="overview-icon overview-icon-purple">
                  <Mail size={18} />
                </div>
                <div className="overview-content">
                  <span className="overview-label">Shortlisted</span>
                  <strong className="overview-value">
                    {filterMode === 'company' && jobMetrics ? jobMetrics.shortlisted : shortlistedCount}
                  </strong>
                </div>
              </div>
              <div className="overview-stat">
                <div className="overview-icon overview-icon-amber">
                  <CheckCircle size={18} />
                </div>
                <div className="overview-content">
                  <span className="overview-label">Interviews</span>
                  <strong className="overview-value">{interviewsScheduled}</strong>
                </div>
              </div>
              <div className="overview-stat">
                <div className="overview-icon overview-icon-green">
                  <CheckCircle size={18} />
                </div>
                <div className="overview-content">
                  <span className="overview-label">Offers</span>
                  <strong className="overview-value">
                    {filterMode === 'company' && jobMetrics ? jobMetrics.offers : selectedCount}
                  </strong>
                </div>
              </div>
              <div className="overview-stat">
                <div className="overview-icon overview-icon-teal">
                  <TrendingUp size={18} />
                </div>
                <div className="overview-content">
                  <span className="overview-label">Hiring Rate</span>
                  <strong className="overview-value">
                    {filterMode === 'company' && jobMetrics ? `${jobMetrics.conversionRate}%` : `${conversionRate}%`}
                  </strong>
                </div>
              </div>
            </div>
          </section>
          {/* Pending Actions + Quick Analytics — 50/50 Horizontal Grid */}
          <div className="admin-pending-analytics-grid">
            {/* LEFT: Pending Actions */}
            <section className="dashboard-section dashboard-section-pending">
              <div className="dashboard-section-head">
                <div>
                  <h2>Pending Actions</h2>
                  <p>Items requiring your immediate attention</p>
                </div>
                <Link to="/company/applicants" className="section-view-all">
                  View All <ChevronRight size={14} />
                </Link>
              </div>
              <div className="pending-actions-list">
                <Link to="/company/applicants" className="pending-action-item">
                  <div className="pending-icon-container pending-icon-amber">
                    <AlertCircle size={20} />
                  </div>
                  <div className="pending-content">
                    <span className="pending-title">Applicants to Review</span>
                    <span className="pending-desc">Review pending candidate profiles</span>
                  </div>
                  <div className="pending-badge">{pendingReview}</div>
                  <ChevronRight size={18} className="pending-arrow" />
                </Link>
                <Link to="/company/shortlist" className="pending-action-item">
                  <div className="pending-icon-container pending-icon-blue">
                    <CalendarIcon size={20} />
                  </div>
                  <div className="pending-content">
                    <span className="pending-title">Interviews to Schedule</span>
                    <span className="pending-desc">Coordinate upcoming interviews</span>
                  </div>
                  <div className="pending-badge">{interviewsScheduled}</div>
                  <ChevronRight size={18} className="pending-arrow" />
                </Link>
                <Link to="/company/shortlist" className="pending-action-item">
                  <div className="pending-icon-container pending-icon-purple">
                    <ListChecks size={20} />
                  </div>
                  <div className="pending-content">
                    <span className="pending-title">Candidate Shortlisting</span>
                    <span className="pending-desc">Move candidates to next round</span>
                  </div>
                  <div className="pending-badge">{shortlistedCount}</div>
                  <ChevronRight size={18} className="pending-arrow" />
                </Link>
                <Link to="/company/manage-jobs" className="pending-action-item">
                  <div className="pending-icon-container pending-icon-green">
                    <Building2 size={20} />
                  </div>
                  <div className="pending-content">
                    <span className="pending-title">Job Approval Updates</span>
                    <span className="pending-desc">Pending job posting approvals</span>
                  </div>
                  <div className="pending-badge">2</div>
                  <ChevronRight size={18} className="pending-arrow" />
                </Link>
              </div>
            </section>

            {/* RIGHT: Quick Analytics */}
            <section className="dashboard-section dashboard-section-analytics">
              <div className="dashboard-section-head">
                <div>
                  <h2>Quick Analytics</h2>
                  <p>Hiring funnel and performance trends</p>
                </div>
              </div>
              <div className="quick-analytics-grid">
                {/* Hiring Funnel - Horizontal Progress Bars */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <h3 className="analytics-card-title">Hiring Funnel</h3>
                    <p className="analytics-card-subtitle">Candidate pipeline status</p>
                  </div>
                  <div className="funnel-chart">
                    {hiringStatsData.map((item) => {
                      const total = hiringStatsData.reduce((sum, d) => sum + d.value, 0) || 1
                      const percentage = Math.round((item.value / total) * 100)
                      return (
                        <div key={item.name} className="funnel-row">
                          <span className="funnel-label">{item.name}</span>
                          <div className="funnel-bar-track">
                            <div
                              className="funnel-bar-fill"
                              style={{
                                width: `${percentage}%`,
                                background:
                                  item.name === 'Selected'
                                    ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                                    : item.name === 'In Progress'
                                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                      : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                              }}
                            />
                          </div>
                          <span className="funnel-value">{item.value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Job-wise Applications - Vertical Bar Graph */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <h3 className="analytics-card-title">Job-wise Applications</h3>
                    <p className="analytics-card-subtitle">Applications by job role</p>
                  </div>
                  <div className="branch-chart">
                    {jobDistribution.map((job) => {
                      const maxStudents = Math.max(...jobDistribution.map((j) => j.students)) || 1
                      const studentHeight = Math.max((job.students / maxStudents) * 100, 8)
                      const hiredHeight = job.students > 0 ? (job.hired / job.students) * studentHeight : 0
                      return (
                        <div key={job.job} className="branch-bar-group">
                          <div className="branch-bars">
                            <div
                              className="branch-bar branch-bar-students"
                              style={{ height: `${studentHeight}%` }}
                              title={`Applications: ${job.students}`}
                            />
                            <div
                              className="branch-bar branch-bar-placed"
                              style={{ height: `${hiredHeight}%` }}
                              title={`Hired: ${job.hired}`}
                            />
                          </div>
                          <span className="branch-label">{job.job.slice(0, 15)}{job.job.length > 15 ? '...' : ''}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Applicant Trend - Monthly Bars */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <h3 className="analytics-card-title">Applicant Trend</h3>
                    <p className="analytics-card-subtitle">Monthly application flow</p>
                  </div>
                  <div className="trend-chart">
                    {trendData.length > 0 ? (
                      trendData.slice(-6).map((item) => {
                        const maxApps = Math.max(...trendData.map((d) => d.applicants)) || 1
                        const barHeight = Math.max((item.applicants / maxApps) * 100, 8)
                        return (
                          <div key={item.month} className="trend-bar-group">
                            <div
                              className="trend-bar"
                              style={{ height: `${barHeight}%` }}
                              title={`${item.applicants} applicants`}
                            />
                            <span className="trend-month">{item.month}</span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="trend-bar-group">
                        <div className="trend-bar" style={{ height: '8%' }} />
                        <span className="trend-month">No Data</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      }
      skipPrimaryCard
      skipAnalyticsCard
      analytics={null}
      insights={null}
    />
  )
}

export default CompanyDashboardHome
