import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Briefcase,
  Shield,
  UserPlus,
  FileUser,
  Search,
  Send,
  BarChart3,
  Mic,
  PartyPopper,
  Building2,
  ClipboardCheck,
  UsersRound,
  SlidersHorizontal,
  ListChecks,
  CalendarClock,
  Handshake,
  Eye,
  ChartNoAxesColumn,
  FileBarChart,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import SectionHeading from './SectionHeading'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DATA
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface JourneyStep {
  title: string
  description: string
  icon: LucideIcon
  /** Is this the celebration / final step? */
  isFinal?: boolean
}

interface Journey {
  id: string
  label: string
  tagline: string
  icon: LucideIcon
  accentFrom: string
  accentTo: string
  /** Dot / connector color */
  dotColor: string
  glowColor: string
  steps: JourneyStep[]
}

const journeys: Journey[] = [
  {
    id: 'student',
    label: 'Student Journey',
    tagline: 'From Registration to Dream Placement',
    icon: GraduationCap,
    accentFrom: '#2563eb',
    accentTo: '#3b82f6',
    dotColor: '#2563eb',
    glowColor: 'rgba(37, 99, 235, 0.12)',
    steps: [
      {
        title: 'Join the Platform',
        description: 'Create your account in seconds and enter the placement ecosystem.',
        icon: UserPlus,
      },
      {
        title: 'Build Your Profile',
        description: 'Add skills, academics, projects and upload your resume to stand out.',
        icon: FileUser,
      },
      {
        title: 'Discover Opportunities',
        description: 'Browse curated job and internship listings from top recruiters.',
        icon: Search,
      },
      {
        title: 'Apply with Confidence',
        description: 'Submit applications with a single click — your profile does the rest.',
        icon: Send,
      },
      {
        title: 'Track Your Progress',
        description: 'Follow every application from submission to final outcome in real-time.',
        icon: BarChart3,
      },
      {
        title: 'Crack Interviews',
        description: 'Attend scheduled interviews and showcase your strengths.',
        icon: Mic,
      },
      {
        title: 'Get Placed',
        description: 'Celebrate your success — you just landed your dream role!',
        icon: PartyPopper,
        isFinal: true,
      },
    ],
  },
  {
    id: 'recruiter',
    label: 'Recruiter Journey',
    tagline: 'Find the Right Talent, Faster',
    icon: Briefcase,
    accentFrom: '#059669',
    accentTo: '#10b981',
    dotColor: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.12)',
    steps: [
      {
        title: 'Register & Get Approved',
        description: 'Sign up as a company and get verified by the placement office.',
        icon: Building2,
      },
      {
        title: 'Post Opportunities',
        description: 'Create detailed job/internship listings with eligibility criteria.',
        icon: Briefcase,
      },
      {
        title: 'Discover Candidates',
        description: 'Access a rich talent pool filtered by skills, branch, and more.',
        icon: UsersRound,
      },
      {
        title: 'Evaluate Profiles',
        description: 'Review resumes, projects and academic records side-by-side.',
        icon: Eye,
      },
      {
        title: 'Conduct Interviews',
        description: 'Schedule and manage multi-round interview workflows.',
        icon: CalendarClock,
      },
      {
        title: 'Hire Smartly',
        description: 'Make data-backed offers and onboard your ideal candidates.',
        icon: Handshake,
        isFinal: true,
      },
    ],
  },
  {
    id: 'admin',
    label: 'Admin / TPO Journey',
    tagline: 'Manage, Monitor, and Maximize Placements',
    icon: Shield,
    accentFrom: '#7c3aed',
    accentTo: '#8b5cf6',
    dotColor: '#7c3aed',
    glowColor: 'rgba(124, 58, 237, 0.12)',
    steps: [
      {
        title: 'Platform Control',
        description: 'Access a unified admin dashboard to oversee every aspect.',
        icon: SlidersHorizontal,
      },
      {
        title: 'Approve Recruiters',
        description: 'Vet and approve companies before they access the student pool.',
        icon: ClipboardCheck,
      },
      {
        title: 'Manage Students',
        description: 'Monitor registrations, profiles, and placement eligibility.',
        icon: ListChecks,
      },
      {
        title: 'Track Applications',
        description: 'See every application flow across all companies in real-time.',
        icon: ChartNoAxesColumn,
      },
      {
        title: 'Analyze Performance',
        description: 'Review placement rates, branch-wise trends, and company metrics.',
        icon: BarChart3,
      },
      {
        title: 'Generate Insights',
        description: 'Export reports and make strategic decisions backed by data.',
        icon: FileBarChart,
        isFinal: true,
      },
    ],
  },
]

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TAB SWITCHER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const TabButton = ({
  journey,
  active,
  onClick,
}: {
  journey: Journey
  active: boolean
  onClick: () => void
}) => {
  const Icon = journey.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      style={
        active
          ? {
              background: `linear-gradient(135deg, ${journey.accentFrom}, ${journey.accentTo})`,
              color: '#ffffff',
              boxShadow: `0 4px 20px ${journey.glowColor.replace('0.12', '0.35')}`,
            }
          : {
              background: '#ffffff',
              color: '#475569',
              boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
            }
      }
    >
      <Icon size={17} strokeWidth={2.2} />
      <span className="hidden sm:inline">{journey.label}</span>
      <span className="sm:hidden">{journey.id === 'admin' ? 'Admin' : journey.label.split(' ')[0]}</span>
    </button>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TIMELINE STEP
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const TimelineStep = ({
  step,
  index,
  total,
  accent,
  glowColor,
  dotColor,
}: {
  step: JourneyStep
  index: number
  total: number
  accent: string
  glowColor: string
  dotColor: string
}) => {
  const Icon = step.icon
  const isLast = index === total - 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex gap-5"
    >
      {/* ── Vertical connector line + dot ── */}
      <div className="relative flex flex-col items-center">
        {/* Dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.35, delay: index * 0.07 + 0.1, type: 'spring', stiffness: 300 }}
          className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-content-center rounded-full"
          style={{
            background: step.isFinal
              ? `linear-gradient(135deg, ${accent}, ${dotColor})`
              : '#ffffff',
            border: step.isFinal ? 'none' : `2px solid ${dotColor}`,
            boxShadow: step.isFinal
              ? `0 0 24px ${glowColor.replace('0.12', '0.4')}`
              : `0 0 0 4px ${glowColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            size={18}
            strokeWidth={2.2}
            style={{ color: step.isFinal ? '#ffffff' : dotColor }}
          />
        </motion.div>

        {/* Connector line */}
        {!isLast && (
          <div
            className="w-0.5 grow"
            style={{
              background: `linear-gradient(to bottom, ${dotColor}40, ${dotColor}15)`,
              minHeight: '24px',
            }}
          />
        )}
      </div>

      {/* ── Content card ── */}
      <motion.div
        whileHover={{ y: -2, boxShadow: `0 8px 28px ${glowColor}` }}
        transition={{ duration: 0.2 }}
        className="mb-6 flex-1 rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-200"
        style={{
          boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-bold"
            style={{
              background: glowColor,
              color: dotColor,
            }}
          >
            {index + 1}
          </span>
          <h4
            className="text-[0.95rem] font-semibold"
            style={{ color: step.isFinal ? accent : '#0f172a' }}
          >
            {step.title}
            {step.isFinal && (
              <span className="ml-2 inline-block animate-bounce text-base">🎉</span>
            )}
          </h4>
        </div>
        <p className="mt-1.5 pl-9 text-[0.84rem] leading-relaxed text-slate-500">
          {step.description}
        </p>
      </motion.div>
    </motion.div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN SECTION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const ProcessSection = () => {
  const [activeId, setActiveId] = useState('student')
  const active = journeys.find((j) => j.id === activeId) ?? journeys[0]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white py-20 md:py-28">
      {/* Subtle decorative blob */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl"
        style={{ background: `radial-gradient(circle, ${active.glowColor.replace('0.12', '0.25')}, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${active.glowColor.replace('0.12', '0.2')}, transparent 70%)` }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 md:px-8">
        {/* ── Page heading ── */}
        <SectionHeading
          eyebrow="How It Works"
          title="Your Journey to Placement Success"
          subtitle="Whether you're a student, recruiter, or administrator — the platform guides you through every step with clarity and confidence."
        />

        {/* ── Tab switcher ── */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {journeys.map((j) => (
            <TabButton
              key={j.id}
              journey={j}
              active={j.id === activeId}
              onClick={() => setActiveId(j.id)}
            />
          ))}
        </div>

        {/* ── Journey tagline ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id + '-tag'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-8 text-center"
          >
            <p className="text-lg font-medium text-slate-700 md:text-xl">
              <span className="italic text-slate-400">&ldquo;</span>
              {active.tagline}
              <span className="italic text-slate-400">&rdquo;</span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ── Timeline ── */}
        <div className="mx-auto mt-10 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {active.steps.map((step, i) => (
                <TimelineStep
                  key={step.title}
                  step={step}
                  index={i}
                  total={active.steps.length}
                  accent={active.accentFrom}
                  glowColor={active.glowColor}
                  dotColor={active.dotColor}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 text-center"
        >
          <p className="mb-5 text-base text-slate-500">
            Ready to start your journey?
          </p>
          <a
            href="/role-selection"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${active.accentFrom}, ${active.accentTo})`,
              boxShadow: `0 8px 28px ${active.glowColor.replace('0.12', '0.3')}`,
            }}
          >
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default ProcessSection
