import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight, TrendingUp as TrendingUpIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import './DashboardLayout.css'

interface HeroMiniStat {
  label: string
  value: string | number
}

interface DashboardLayoutProps {
  title: string
  subtitle: string
  greeting?: string
  user?: { name: string }
  kpis: ReactNode
  analytics?: ReactNode
  calendar?: ReactNode
  activity: ReactNode
  quickActions?: ReactNode
  insights: ReactNode
  error?: string | null
  /** When true, uses the premium command-center layout (70/30 grid) */
  compactLayout?: boolean
  /** CSS gradient string to override the hero banner colour per role */
  heroGradient?: string
  /** lucide-react icon component to show beside the title in the hero */
  roleIcon?: LucideIcon
  /** Primary content section above the main grid (e.g. Job Opportunities, Charts) */
  primaryContent?: ReactNode
  /** Title for the primary content section */
  primaryContentTitle?: string
  /** Subtitle for the primary content section */
  primaryContentSubtitle?: string
  /** Header-right element for primary content (e.g. "View All" link) */
  primaryContentHeaderRight?: ReactNode
  /** Right-side glassmorphism stat cards in the hero */
  heroStats?: HeroMiniStat[]
  /** Readiness / status label shown in the hero badge */
  readinessLabel?: string
  /** Progress percentage shown in the hero (0-100) */
  readinessPercent?: number
  /** When true, renders primaryContent directly without the wrapping SectionCard */
  skipPrimaryCard?: boolean
  /** @deprecated Use primaryContent + primaryContentTitle instead */
  jobOpportunities?: ReactNode
  /** @deprecated Use primaryContentHeaderRight instead */
  viewAllJobsLink?: string
  /** Custom title for the analytics section (default: "Analytics") */
  analyticsTitle?: string
  /** Custom subtitle for the analytics section */
  analyticsSubtitle?: string
  /** Custom title for the activity section (default: "Recent Activity") */
  activityTitle?: string
  /** Custom subtitle for the activity section */
  activitySubtitle?: string
  /** Header-right element for the activity section (e.g. "View All" link) */
  activityHeaderRight?: ReactNode
  /** When true, renders activity content directly without the wrapping SectionCard */
  skipActivityCard?: boolean
  /** When true, renders quickActions directly without the section wrapper and title */
  skipQuickActionsCard?: boolean
  /** When true, hides the analytics section entirely */
  skipAnalyticsCard?: boolean
}

interface SectionCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  collapsible?: boolean
  headerRight?: ReactNode
  className?: string
}

const SectionCard = ({
  title,
  subtitle,
  children,
  collapsible = true,
  headerRight,
  className = '',
}: SectionCardProps) => {
  if (!collapsible) {
    return (
      <section className={`dashboard-section ${className}`}>
        <div className="dashboard-section-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {headerRight}
        </div>
        <div>{children}</div>
      </section>
    )
  }

  return (
    <details className={`dashboard-section dashboard-section-collapsible ${className}`} open>
      <summary>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </summary>
      <div>{children}</div>
    </details>
  )
}

const DashboardLayout = ({
  title,
  subtitle,
  greeting,
  user,
  kpis,
  analytics,
  calendar,
  activity,
  quickActions,
  insights,
  error,
  compactLayout = false,
  heroGradient,
  roleIcon: RoleIcon,
  primaryContent,
  primaryContentTitle,
  primaryContentSubtitle,
  primaryContentHeaderRight,
  heroStats,
  readinessLabel,
  readinessPercent,
  skipPrimaryCard = false,
  // deprecated compat
  jobOpportunities,
  viewAllJobsLink,
  // configurable section titles
  analyticsTitle = 'Analytics',
  analyticsSubtitle = 'Performance and trend insights',
  activityTitle = 'Recent Activity',
  activitySubtitle = 'Latest actions and updates',
  activityHeaderRight,
  skipActivityCard = false,
  skipQuickActionsCard = false,
  skipAnalyticsCard = false,
}: DashboardLayoutProps) => {
  // Resolve primary content — prefer new prop, fall back to deprecated jobOpportunities
  const resolvedPrimary = primaryContent ?? jobOpportunities
  const resolvedPrimaryTitle = primaryContentTitle ?? 'Job Opportunities'
  const resolvedPrimarySubtitle = primaryContentSubtitle ?? 'Top picks based on your profile'
  const resolvedPrimaryHeaderRight =
    primaryContentHeaderRight ??
    (viewAllJobsLink ? (
      <Link to={viewAllJobsLink} className="section-view-all">
        View All Jobs <ChevronRight size={14} />
      </Link>
    ) : undefined)

  // ── Premium command-center layout (used by ALL role dashboards) ──
  if (compactLayout) {
    return (
      <div className="dashboard-shell">
        {/* ═══ HERO SECTION ═══ */}
        <motion.header
          className={`dashboard-hero dashboard-hero-premium${heroStats && heroStats.length > 0 ? ' hero-has-stats' : ''}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={heroGradient ? { background: heroGradient } : undefined}
        >
          {/* LEFT: Welcome & System Status */}
          <div className="dashboard-hero-left">
            <div className="dashboard-hero-content">
              {RoleIcon && (
                <RoleIcon size={22} strokeWidth={2} className="dashboard-hero-icon" />
              )}
              <div className="dashboard-hero-greeting">
                <span className="greeting-prefix">Welcome back,</span>
                <span className="greeting-name">{user?.name || 'admin'}! 👋</span>
              </div>
            </div>
            <p className="dashboard-hero-subtitle">{subtitle}</p>

            {readinessLabel && (
              <div className="dashboard-hero-readiness">
                <span className="readiness-badge">
                  <span className="readiness-dot" />
                  {readinessLabel}
                  {readinessPercent !== undefined && readinessPercent > 0 && (
                    <span className="readiness-percent">{readinessPercent}%</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Glassmorphic KPI Stat Cards */}
          {heroStats && heroStats.length > 0 && (
            <div className="hero-glass-stats-wrap">
              {heroStats.map((stat) => (
                <div key={stat.label} className="hero-glass-card">
                  <div className="hero-glass-icon">
                    <TrendingUpIcon size={14} />
                  </div>
                  <span className="hero-glass-value">{stat.value}</span>
                  <span className="hero-glass-label">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </motion.header>

        {/* ═══ ERROR ═══ */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="dashboard-error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ KPI STRIP ═══ */}
        {kpis && <section className="dashboard-kpi-grid">{kpis}</section>}

        {/* ═══ QUICK ACTIONS ═══ */}
        {quickActions && (
          skipQuickActionsCard ? (
            quickActions
          ) : (
            <section className="dashboard-section dashboard-section-quick-actions">
              <div className="dashboard-section-head">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Core operations — students, companies, approvals, and reports</p>
                </div>
              </div>
              {quickActions}
            </section>
          )
        )}

        {/* ═══ OPERATIONS & ACTIVITY GRID ═══ */}
        <div className={`dashboard-grid ${calendar ? 'dashboard-grid-premium' : 'dashboard-grid-full'}`}>
          {/* LEFT COLUMN: Activity — full-width when no calendar */}
          <div className="dashboard-col-main">
            {skipActivityCard ? (
              activity
            ) : (
              <SectionCard
                title={activityTitle}
                subtitle={activitySubtitle}
                collapsible={false}
                className="dashboard-section-operations"
                headerRight={activityHeaderRight}
              >
                {activity}
              </SectionCard>
            )}
          </div>

          {/* RIGHT COLUMN: Calendar (30%) — hidden when calendar prop is absent */}
          {calendar && (
            <div className="dashboard-col-side">
              <section className="dashboard-calendar-slot">{calendar}</section>
            </div>
          )}
        </div>

        {/* ═══ PRIMARY ANALYTICS SECTION ═══ */}
        {resolvedPrimary && (
          skipPrimaryCard ? (
            resolvedPrimary
          ) : (
            <SectionCard
              title={resolvedPrimaryTitle}
              subtitle={resolvedPrimarySubtitle}
              collapsible={false}
              className="dashboard-section-primary"
              headerRight={resolvedPrimaryHeaderRight}
            >
              {resolvedPrimary}
            </SectionCard>
          )
        )}

        {/* ═══ STRATEGIC INSIGHTS GRID ═══ */}
        {!skipAnalyticsCard && (
          <div className="dashboard-grid dashboard-grid-premium">
            {/* LEFT COLUMN: Detailed Metrics (70%) */}
            <div className="dashboard-col-main">
              {analytics && (
                <SectionCard
                  title={analyticsTitle}
                  subtitle={analyticsSubtitle}
                  collapsible={false}
                >
                  {analytics}
                </SectionCard>
              )}
            </div>

            {/* RIGHT COLUMN: AI Insights (30%) */}
            <div className="dashboard-col-side">
              <SectionCard
                title="Admin Intelligence"
                subtitle="Strategic suggestions and drive alerts"
                collapsible={false}
                className="dashboard-section-insights"
              >
                {insights}
              </SectionCard>
            </div>
          </div>
        )}
        {skipAnalyticsCard && insights && (
          <section className="dashboard-section dashboard-section-insights">
            <div className="dashboard-section-head">
              <div>
                <h2>Admin Intelligence</h2>
                <p>Strategic suggestions and drive alerts</p>
              </div>
            </div>
            {insights}
          </section>
        )}
      </div>
    )
  }

  // ── Default mode (fallback — not used by any current role) ──
  return (
    <div className="dashboard-shell">
      <motion.header
        className="dashboard-hero"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={heroGradient ? { background: heroGradient } : undefined}
      >
        <div className="dashboard-hero-content">
          {RoleIcon && (
            <RoleIcon size={26} strokeWidth={2} className="dashboard-hero-icon" />
          )}
          <h1>{greeting || title}</h1>
        </div>
      </motion.header>

      <AnimatePresence>
        {error && (
          <motion.div
            className="dashboard-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="dashboard-kpi-grid">{kpis}</section>

      {calendar && (
        <section className="dashboard-calendar-slot">{calendar}</section>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-col-main">
          <SectionCard
            title={analyticsTitle}
            subtitle={analyticsSubtitle}
            collapsible={false}
          >
            {analytics}
          </SectionCard>
          <SectionCard title="Quick Actions" subtitle="Common tasks to keep workflows moving">
            {quickActions}
          </SectionCard>
        </div>
        <div className="dashboard-col-side">
          <SectionCard title={activityTitle} subtitle={activitySubtitle}>
            {activity}
          </SectionCard>
          <SectionCard
            title="Recommendations"
            subtitle="Smart suggestions to improve outcomes"
          >
            {insights}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
