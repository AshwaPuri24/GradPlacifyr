import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Users,
  FileBarChart,
  ChevronRight,
  TrendingUp,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Mail,
  Building2,
  FileCheck,
  Activity,
  BarChart3,
  Shield,
  ChevronDown,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getJobs, type Job } from '../../api/jobs'
import { getApplications, type PortalApplication } from '../../api/applications'
import { getUsers, type PortalUser } from '../../api/users'
import { getRoleTheme } from '../../utils/roleConfig'
import {
  ActivityTimeline,
  DashboardLayout,
  EventCalendar,
  WorkflowCard,
  type TimelineItem,
} from '../../components/dashboard'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const AdminDashboardHome = () => {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<PortalApplication[]>([])
  const [students, setStudents] = useState<PortalUser[]>([])
  const [_companies, setCompanies] = useState<PortalUser[]>([])

  useEffect(() => {
    Promise.all([getJobs(), getApplications(), getUsers('student'), getUsers('recruiter')])
      .then(([jobRows, appRows, studentRows, companyRows]) => {
        setJobs(jobRows)
        setApplications(appRows)
        setStudents(studentRows)
        setCompanies(companyRows)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard data'
        setError(message)
      })
  }, [])

  // ── Derived metrics ──

  const activeCompanies = useMemo(() => new Set(jobs.map((j) => j.company)).size, [jobs])
  const activeJobs = useMemo(() => jobs.filter((j) => j.status === 'open').length, [jobs])

  const selectedCount = useMemo(
    () => applications.filter((a) => a.status === 'selected').length,
    [applications]
  )

  const placementPercentage = useMemo(() => {
    if (!applications.length) return 0
    return Math.round((selectedCount / applications.length) * 100)
  }, [applications.length, selectedCount])

  const interviewsScheduled = useMemo(
    () => applications.filter((a) => ['test_scheduled', 'interview_scheduled'].includes(a.status)).length,
    [applications]
  )

  // ── Chart data ──

  const placementStatsData = useMemo(() => {
    const rejected = applications.filter((a) => a.status === 'rejected').length
    const inProgress = Math.max(applications.length - selectedCount - rejected, 0)
    return [
      { name: 'Selected', value: selectedCount },
      { name: 'In Progress', value: inProgress },
      { name: 'Rejected', value: rejected },
    ]
  }, [applications, selectedCount])

  const trendData = useMemo(() => {
    const monthMap = new Map<string, number>()
    for (const app of applications) {
      const dt = new Date(app.appliedAt)
      const key = `${MONTH_SHORT[dt.getMonth()]} ${String(dt.getFullYear()).slice(2)}`
      monthMap.set(key, (monthMap.get(key) || 0) + 1)
    }
    return Array.from(monthMap.entries()).map(([month, applicationsCount]) => ({ month, applications: applicationsCount }))
  }, [applications])

  const branchDistribution = useMemo(() => [
    { branch: 'CSE/IT', students: Math.round(students.length * 0.36), placed: Math.round(students.length * 0.36 * 0.52) },
    { branch: 'ECE', students: Math.round(students.length * 0.24), placed: Math.round(students.length * 0.24 * 0.48) },
    { branch: 'BBA', students: Math.round(students.length * 0.22), placed: Math.round(students.length * 0.22 * 0.45) },
    { branch: 'BCA', students: Math.round(students.length * 0.18), placed: Math.round(students.length * 0.18 * 0.42) },
  ], [students.length])

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

  // ── Smart suggestions ──

  const pendingApprovals = useMemo(
    () => applications.filter((a) => a.status === 'applied').length,
    [applications]
  )

  const shortlistedCount = useMemo(
    () => applications.filter((a) => a.status === 'shortlisted').length,
    [applications]
  )

  const offersCount = useMemo(
    () => applications.filter((a) => a.status === 'selected').length,
    [applications]
  )

  // ── Filter state ──
  const [filterMode, setFilterMode] = useState<'month' | 'company'>('month')
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // ── Company list from jobs ──
  const companyList = useMemo(() => {
    const companySet = new Set(jobs.map((j) => j.company))
    return Array.from(companySet).sort()
  }, [jobs])

  // ── Company-filtered metrics ──
  const companyMetrics = useMemo(() => {
    if (!selectedCompany) return null

    const companyJobs = jobs.filter((j) => j.company === selectedCompany)
    const companyJobIds = new Set(companyJobs.map((j) => j.id))
    const companyApplications = applications.filter((a) => companyJobIds.has(a.jobId))

    const companySelected = companyApplications.filter((a) => a.status === 'selected').length
    const companyShortlisted = companyApplications.filter((a) => a.status === 'shortlisted').length
    const companyActiveJobs = companyJobs.filter((j) => j.status === 'open').length

    const companyPlacementPercentage = companyApplications.length
      ? Math.round((companySelected / companyApplications.length) * 100)
      : 0

    return {
      activeCompanies: 1,
      activeJobs: companyActiveJobs,
      applications: companyApplications.length,
      shortlisted: companyShortlisted,
      offers: companySelected,
      conversionRate: companyPlacementPercentage,
    }
  }, [selectedCompany, jobs, applications])

  // ── Render ──

  const roleTheme = getRoleTheme(user?.role ?? 'admin')

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
      title="Admin Dashboard"
      subtitle="Here is an overview of your placement operations today."
      compactLayout
      heroGradient={roleTheme.heroGradient}
      roleIcon={roleTheme.icon}
      error={error}
      readinessLabel="System Health: Active"
      heroStats={[
        { label: 'Active Drives', value: activeJobs },
        { label: 'Pending Approvals', value: pendingApprovals },
        { label: "Today's Interviews", value: interviewsScheduled },
        { label: 'Students Placed', value: selectedCount },
        { label: 'Placement Rate', value: `${placementPercentage}%` },
      ]}
      kpis={null}
      skipQuickActionsCard
      quickActions={
        <div className="workflow-cards-grid workflow-cards-6">
          <WorkflowCard
            to="/admin/manage-tpo"
            title="Manage TPO"
            subtitle="Manage TPO accounts and permissions"
            icon={Shield}
            color="blue"
          />
          <WorkflowCard
            to="/admin/manage-students"
            title="Manage Students"
            subtitle="View and maintain student records"
            icon={Users}
            color="indigo"
          />
          <WorkflowCard
            to="/admin/manage-companies"
            title="Manage Companies"
            subtitle="Manage recruiter and company details"
            icon={Building2}
            color="teal"
          />
          <WorkflowCard
            to="/admin/approve-jobs"
            title="Approve JNF / TNF"
            subtitle="Validate and approve job postings"
            icon={FileCheck}
            color="amber"
          />
          <WorkflowCard
            to="/admin/monitor-applications"
            title="Monitor Applications"
            subtitle="Track student applications"
            icon={Activity}
            color="purple"
          />
          <WorkflowCard
            to="/admin/reports"
            title="Placement Reports"
            subtitle="View analytics and reports"
            icon={BarChart3}
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
                  <p>Latest platform updates and student movement</p>
                </div>
              </div>
              <Link to="/admin/monitor-applications" className="admin-view-all">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="admin-activity-scroll">
              <ActivityTimeline items={activityItems} emptyText="No recent platform activity yet." />
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
                <h2>Overview — {filterMode === 'month' ? 'This Month' : selectedCompany || 'All Companies'}</h2>
                <p>Key placement metrics</p>
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
                    Company Wise
                    <ChevronDown size={14} className={`company-dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
                  </button>
                  {isDropdownOpen && filterMode === 'company' && (
                    <div className="company-dropdown-menu">
                      <div className="company-dropdown-list">
                        {companyList.map((company) => (
                          <button
                            key={company}
                            className={`company-dropdown-item ${selectedCompany === company ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCompany(company)
                              setIsDropdownOpen(false)
                            }}
                            aria-selected={selectedCompany === company}
                          >
                            {company}
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
                    {filterMode === 'company' && selectedCompany ? selectedCompany : 'Active Companies'}
                  </span>
                  <strong className="overview-value">
                    {filterMode === 'company' && companyMetrics ? companyMetrics.activeCompanies : activeCompanies}
                  </strong>
                </div>
              </div>
              <div className="overview-stat">
                <div className="overview-icon overview-icon-indigo">
                  <FileBarChart size={18} />
                </div>
                <div className="overview-content">
                  <span className="overview-label">
                    {filterMode === 'company' && selectedCompany ? 'Open Roles' : 'New Opportunities'}
                  </span>
                  <strong className="overview-value">
                    {filterMode === 'company' && companyMetrics ? companyMetrics.activeJobs : activeJobs}
                  </strong>
                </div>
              </div>
              <div className="overview-stat">
                <div className="overview-icon overview-icon-purple">
                  <Mail size={18} />
                </div>
                <div className="overview-content">
                  <span className="overview-label">Applications</span>
                  <strong className="overview-value">
                    {filterMode === 'company' && companyMetrics ? companyMetrics.applications : applications.length}
                  </strong>
                </div>
              </div>
              <div className="overview-stat">
                <div className="overview-icon overview-icon-amber">
                  <CheckCircle size={18} />
                </div>
                <div className="overview-content">
                  <span className="overview-label">Shortlisted</span>
                  <strong className="overview-value">
                    {filterMode === 'company' && companyMetrics ? companyMetrics.shortlisted : shortlistedCount}
                  </strong>
                </div>
              </div>
              <div className="overview-stat">
                <div className="overview-icon overview-icon-green">
                  <CheckCircle size={18} />
                </div>
                <div className="overview-content">
                  <span className="overview-label">Offers</span>
                  <strong className="overview-value">
                    {filterMode === 'company' && companyMetrics ? companyMetrics.offers : offersCount}
                  </strong>
                </div>
              </div>
              <div className="overview-stat">
                <div className="overview-icon overview-icon-teal">
                  <TrendingUp size={18} />
                </div>
                <div className="overview-content">
                  <span className="overview-label">Conversion Rate</span>
                  <strong className="overview-value">
                    {filterMode === 'company' && companyMetrics ? `${companyMetrics.conversionRate}%` : `${placementPercentage}%`}
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
                <Link to="/admin/approve-jobs" className="section-view-all">
                  View All <ChevronRight size={14} />
                </Link>
              </div>
              <div className="pending-actions-list">
                <Link to="/admin/approve-jobs" className="pending-action-item">
                  <div className="pending-icon-container pending-icon-amber">
                    <AlertCircle size={20} />
                  </div>
                  <div className="pending-content">
                    <span className="pending-title">JNF Approvals Pending</span>
                    <span className="pending-desc">Review and approve job postings</span>
                  </div>
                  <div className="pending-badge">{pendingApprovals}</div>
                  <ChevronRight size={18} className="pending-arrow" />
                </Link>
                <Link to="/admin/monitor-applications" className="pending-action-item">
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
                <Link to="/admin/manage-students" className="pending-action-item">
                  <div className="pending-icon-container pending-icon-purple">
                    <Users size={20} />
                  </div>
                  <div className="pending-content">
                    <span className="pending-title">Student Verifications</span>
                    <span className="pending-desc">Pending student document reviews</span>
                  </div>
                  <div className="pending-badge">3</div>
                  <ChevronRight size={18} className="pending-arrow" />
                </Link>
                <Link to="/admin/manage-companies" className="pending-action-item">
                  <div className="pending-icon-container pending-icon-green">
                    <Building2 size={20} />
                  </div>
                  <div className="pending-content">
                    <span className="pending-title">Recruiter Approvals</span>
                    <span className="pending-desc">Pending company account reviews</span>
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
                  <p>Placement funnel and performance trends</p>
                </div>
              </div>
              <div className="quick-analytics-grid">
                {/* Placement Funnel - Horizontal Progress Bars */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <h3 className="analytics-card-title">Placement Funnel</h3>
                    <p className="analytics-card-subtitle">Application pipeline status</p>
                  </div>
                  <div className="funnel-chart">
                    {placementStatsData.map((item) => {
                      const total = placementStatsData.reduce((sum, d) => sum + d.value, 0) || 1
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
                                      : 'linear-gradient(90deg, #ef4444, #f87171)',
                              }}
                            />
                          </div>
                          <span className="funnel-value">{item.value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Branch Placement - Vertical Bar Graph */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <h3 className="analytics-card-title">Branch Placement</h3>
                    <p className="analytics-card-subtitle">Students placed by branch</p>
                  </div>
                  <div className="branch-chart">
                    {branchDistribution.map((branch) => {
                      const maxStudents = Math.max(...branchDistribution.map((b) => b.students)) || 1
                      const studentHeight = Math.max((branch.students / maxStudents) * 100, 8)
                      const placedHeight = branch.students > 0 ? (branch.placed / branch.students) * studentHeight : 0
                      return (
                        <div key={branch.branch} className="branch-bar-group">
                          <div className="branch-bars">
                            <div
                              className="branch-bar branch-bar-students"
                              style={{ height: `${studentHeight}%` }}
                              title={`Students: ${branch.students}`}
                            />
                            <div
                              className="branch-bar branch-bar-placed"
                              style={{ height: `${placedHeight}%` }}
                              title={`Placed: ${branch.placed}`}
                            />
                          </div>
                          <span className="branch-label">{branch.branch}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Applications Trend - Monthly Bars */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <h3 className="analytics-card-title">Applications Trend</h3>
                    <p className="analytics-card-subtitle">Monthly application flow</p>
                  </div>
                  <div className="trend-chart">
                    {trendData.length > 0 ? (
                      trendData.slice(-6).map((item) => {
                        const maxApps = Math.max(...trendData.map((d) => d.applications)) || 1
                        const barHeight = Math.max((item.applications / maxApps) * 100, 8)
                        return (
                          <div key={item.month} className="trend-bar-group">
                            <div
                              className="trend-bar"
                              style={{ height: `${barHeight}%` }}
                              title={`${item.applications} applications`}
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

export default AdminDashboardHome
