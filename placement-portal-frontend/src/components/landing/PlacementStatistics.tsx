import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Building2,
  TrendingUp,
  Award,
  Users,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from 'recharts'
import SectionHeading from './SectionHeading'

/* ─── Real placement data extracted from JIMS PDFs ─── */

interface BatchRecord {
  batch: string
  studentsPlaced: number
  highestPackage: number
  companiesVisited: number
}

interface CourseData {
  course: string
  color: string
  gradient: string
  icon: typeof GraduationCap
  records: BatchRecord[]
}

const courseData: CourseData[] = [
  {
    course: 'MCA',
    color: '#1f4b9c',
    gradient: 'from-blue-600 to-indigo-700',
    icon: GraduationCap,
    records: [
      { batch: '2023-25', studentsPlaced: 161, highestPackage: 11.3, companiesVisited: 108 },
      { batch: '2022-24', studentsPlaced: 107, highestPackage: 11.1, companiesVisited: 90 },
      { batch: '2021-23', studentsPlaced: 105, highestPackage: 10.2, companiesVisited: 80 },
      { batch: '2020-22', studentsPlaced: 90, highestPackage: 11.1, companiesVisited: 55 },
      { batch: '2019-22', studentsPlaced: 37, highestPackage: 11.0, companiesVisited: 50 },
      { batch: '2018-21', studentsPlaced: 116, highestPackage: 10.0, companiesVisited: 57 },
      { batch: '2017-20', studentsPlaced: 116, highestPackage: 10.0, companiesVisited: 60 },
      { batch: '2016-19', studentsPlaced: 97, highestPackage: 6.5, companiesVisited: 60 },
      { batch: '2015-18', studentsPlaced: 88, highestPackage: 7.94, companiesVisited: 63 },
    ],
  },
  {
    course: 'BCA',
    color: '#0d9488',
    gradient: 'from-teal-500 to-emerald-600',
    icon: Users,
    records: [
      { batch: '2022-25', studentsPlaced: 59, highestPackage: 7.0, companiesVisited: 56 },
      { batch: '2021-24', studentsPlaced: 61, highestPackage: 7.0, companiesVisited: 54 },
      { batch: '2020-23', studentsPlaced: 61, highestPackage: 7.0, companiesVisited: 41 },
      { batch: '2019-22', studentsPlaced: 58, highestPackage: 5.41, companiesVisited: 20 },
      { batch: '2018-21', studentsPlaced: 56, highestPackage: 12.0, companiesVisited: 22 },
      { batch: '2017-20', studentsPlaced: 58, highestPackage: 12.2, companiesVisited: 16 },
      { batch: '2016-19', studentsPlaced: 48, highestPackage: 3.8, companiesVisited: 18 },
      { batch: '2015-18', studentsPlaced: 55, highestPackage: 3.3, companiesVisited: 20 },
    ],
  },
  {
    course: 'BBA',
    color: '#d97706',
    gradient: 'from-amber-500 to-orange-600',
    icon: Award,
    records: [
      { batch: '2022-25', studentsPlaced: 43, highestPackage: 8.0, companiesVisited: 83 },
      { batch: '2021-24', studentsPlaced: 52, highestPackage: 10.0, companiesVisited: 55 },
      { batch: '2020-23', studentsPlaced: 43, highestPackage: 9.0, companiesVisited: 47 },
      { batch: '2019-22', studentsPlaced: 48, highestPackage: 5.35, companiesVisited: 20 },
      { batch: '2018-21', studentsPlaced: 48, highestPackage: 10.0, companiesVisited: 22 },
      { batch: '2017-20', studentsPlaced: 56, highestPackage: 10.0, companiesVisited: 25 },
      { batch: '2016-19', studentsPlaced: 53, highestPackage: 4.4, companiesVisited: 24 },
      { batch: '2015-18', studentsPlaced: 48, highestPackage: 4.4, companiesVisited: 27 },
    ],
  },
]

const TABS = ['All Programs', 'MCA', 'BCA', 'BBA'] as const
type Tab = (typeof TABS)[number]

const PIE_COLORS = ['#1f4b9c', '#0d9488', '#d97706', '#8b5cf6']

/* ─── Count-up hook ─── */
function useCountUp(target: number, start: boolean, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    const startTs = performance.now()
    const frame = (time: number) => {
      const progress = Math.min((time - startTs) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [target, start, duration])
  return count
}

/* ─── Animated Stat Mini-Card ─── */
const AnimatedStat = ({
  label,
  value,
  suffix,
  icon: Icon,
  start,
}: {
  label: string
  value: number
  suffix: string
  icon: typeof GraduationCap
  start: boolean
}) => {
  const animatedValue = useCountUp(value, start)
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">
          {animatedValue}
          {suffix}
        </p>
        <p className="text-xs text-white/70">{label}</p>
      </div>
    </div>
  )
}

/* ─── Course Summary Card ─── */
const CourseSummaryCard = ({ data, start }: { data: CourseData; start: boolean }) => {
  const latest = data.records[0]
  const totalPlaced = data.records.reduce((s, r) => s + r.studentsPlaced, 0)
  const maxPackage = Math.max(...data.records.map((r) => r.highestPackage))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${data.gradient} p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}
    >
      {/* Decorative circle */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />

      {/* Header */}
      <div className="relative mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <data.icon className="h-5 w-5 text-white/90" />
          <h3 className="text-lg font-bold text-white">{data.course}</h3>
        </div>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          {latest.batch}
        </span>
      </div>

      {/* Stats grid */}
      <div className="relative grid grid-cols-2 gap-4">
        <AnimatedStat
          label="Latest Placed"
          value={latest.studentsPlaced}
          suffix=""
          icon={GraduationCap}
          start={start}
        />
        <AnimatedStat
          label="Max Package"
          value={maxPackage}
          suffix=" LPA"
          icon={TrendingUp}
          start={start}
        />
        <AnimatedStat
          label="Total Placed"
          value={totalPlaced}
          suffix="+"
          icon={Users}
          start={start}
        />
        <AnimatedStat
          label="Companies"
          value={latest.companiesVisited}
          suffix="+"
          icon={Building2}
          start={start}
        />
      </div>

      {/* Growth indicator */}
      {data.records.length >= 2 && (
        <div className="relative mt-4 flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-sm">
          <ArrowUpRight className="h-3.5 w-3.5 text-green-300" />
          <span className="text-xs font-medium text-white/90">
            {latest.studentsPlaced > data.records[1].studentsPlaced
              ? `+${latest.studentsPlaced - data.records[1].studentsPlaced} placements vs previous batch`
              : `${latest.studentsPlaced} placements this batch`}
          </span>
        </div>
      )}
    </motion.div>
  )
}

/* ─── Custom tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
          {entry.name.includes('Package') ? ' LPA' : ''}
        </p>
      ))}
    </div>
  )
}

/* ─── Main Component ─── */
const PlacementStatistics = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<Tab>('All Programs')
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  /* ── Filtered courses ── */
  const filteredCourses = useMemo(
    () =>
      activeTab === 'All Programs'
        ? courseData
        : courseData.filter((c) => c.course === activeTab),
    [activeTab]
  )

  /* ── Bar chart: students placed by batch (latest 5 batches) ── */
  const barChartData = useMemo(() => {
    const batchMap = new Map<string, Record<string, number>>()
    for (const course of filteredCourses) {
      for (const rec of course.records.slice(0, 5)) {
        const existing = batchMap.get(rec.batch) || {}
        existing[course.course] = rec.studentsPlaced
        batchMap.set(rec.batch, existing)
      }
    }
    return Array.from(batchMap.entries())
      .map(([batch, vals]) => ({ batch, ...vals }))
      .reverse()
  }, [filteredCourses])

  /* ── Pie chart: total placements per course ── */
  const pieData = useMemo(
    () =>
      filteredCourses.map((c) => ({
        name: c.course,
        value: c.records.reduce((s, r) => s + r.studentsPlaced, 0),
      })),
    [filteredCourses]
  )

  /* ── Line chart: highest package trend ── */
  const lineChartData = useMemo(() => {
    const batchMap = new Map<string, Record<string, number>>()
    for (const course of filteredCourses) {
      for (const rec of course.records.slice(0, 6)) {
        const existing = batchMap.get(rec.batch) || {}
        existing[course.course] = rec.highestPackage
        batchMap.set(rec.batch, existing)
      }
    }
    return Array.from(batchMap.entries())
      .map(([batch, vals]) => ({ batch, ...vals }))
      .reverse()
  }, [filteredCourses])

  /* ── Aggregate stats ── */
  const aggregateStats = useMemo(() => {
    const allRecords = filteredCourses.flatMap((c) => c.records)
    const latestRecords = filteredCourses.map((c) => c.records[0])
    return {
      totalPlaced: allRecords.reduce((s, r) => s + r.studentsPlaced, 0),
      highestPackage: Math.max(...allRecords.map((r) => r.highestPackage)),
      totalCompanies: Math.max(...latestRecords.map((r) => r.companiesVisited)),
      programs: filteredCourses.length,
    }
  }, [filteredCourses])

  return (
    <section
      ref={sectionRef}
      id="statistics"
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 md:py-28"
    >
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #1f4b9c 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-8">
        {/* ── Section heading ── */}
        <SectionHeading
          eyebrow="Analytics"
          title="Placement Statistics"
          subtitle="Real placement insights across programs — powered by verified institutional data from JIMS Rohini Sector-5."
        />

        {/* ── Aggregate highlight bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4"
        >
          {[
            { label: 'Total Students Placed', value: aggregateStats.totalPlaced, suffix: '+', icon: GraduationCap },
            { label: 'Highest Package', value: aggregateStats.highestPackage, suffix: ' LPA', icon: TrendingUp },
            { label: 'Top Companies', value: aggregateStats.totalCompanies, suffix: '+', icon: Building2 },
            { label: 'Programs', value: aggregateStats.programs, suffix: '', icon: BarChart3 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-blue-100/80 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <stat.icon className="h-4 w-4 text-jimsBlue" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 md:text-xl">
                  {inView ? <CountUpSpan target={stat.value} suffix={stat.suffix} /> : `0${stat.suffix}`}
                </p>
                <p className="text-[11px] leading-tight text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Tab selector ── */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-jimsBlue text-white shadow-md shadow-blue-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-jimsBlue'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Course Cards ── */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((c) => (
              <CourseSummaryCard key={c.course} data={c} start={inView} />
            ))}
          </AnimatePresence>
        </div>

        {/* ── Charts Section ── */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-jimsBlue" />
              <h3 className="text-base font-bold text-slate-900">Students Placed by Batch</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="batch"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {filteredCourses.map((c) => (
                    <Bar
                      key={c.course}
                      dataKey={c.course}
                      name={c.course}
                      fill={c.color}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie chart */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-jimsBlue" />
              <h3 className="text-base font-bold text-slate-900">Placement Distribution</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Line chart — full width */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6 lg:col-span-2"
          >
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-jimsBlue" />
              <h3 className="text-base font-bold text-slate-900">Highest Package Trend (LPA)</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineChartData}>
                  <defs>
                    {filteredCourses.map((c) => (
                      <linearGradient key={c.course} id={`grad-${c.course}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={c.color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={c.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="batch"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {filteredCourses.map((c) => (
                    <Area
                      key={c.course}
                      type="monotone"
                      dataKey={c.course}
                      name={`${c.course} Package`}
                      stroke={c.color}
                      strokeWidth={2.5}
                      fill={`url(#grad-${c.course})`}
                      dot={{ r: 4, fill: c.color, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ── Batch-wise detailed table ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
          className="mt-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 md:px-6">
            <BarChart3 className="h-5 w-5 text-jimsBlue" />
            <h3 className="text-base font-bold text-slate-900">Detailed Batch Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Program</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Batch</th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-600">Students Placed</th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-600">Highest Package</th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-600">Companies Visited</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.flatMap((c) =>
                  c.records.slice(0, 5).map((r, i) => (
                    <tr
                      key={`${c.course}-${r.batch}`}
                      className="border-b border-slate-50 transition-colors hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-2.5">
                        {i === 0 && (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                            style={{ backgroundColor: c.color }}
                          >
                            {c.course}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-2.5 font-medium text-slate-700">{r.batch}</td>
                      <td className="px-5 py-2.5 text-right font-semibold text-slate-900">
                        {r.studentsPlaced}
                      </td>
                      <td className="px-5 py-2.5 text-right font-semibold text-slate-900">
                        {r.highestPackage} LPA
                      </td>
                      <td className="px-5 py-2.5 text-right text-slate-600">{r.companiesVisited}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Tiny count-up span ─── */
const CountUpSpan = ({ target, suffix }: { target: number; suffix: string }) => {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const dur = 1200
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setVal(Number((target * (1 - Math.pow(1 - p, 3))).toFixed(1)))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])
  return (
    <>
      {Number.isInteger(target) ? Math.round(val) : val}
      {suffix}
    </>
  )
}

export default PlacementStatistics
