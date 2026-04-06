import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Home,
  Eye,
  Target,
  ShieldCheck,
  Award,
  GraduationCap,
  Users,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Globe,
  Star,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'
import LandingHeader from '../../components/landing/LandingHeader'
import LandingFooter from '../../components/landing/LandingFooter'
import heroBg from '../../assets/hero-bg.jpg'

/* ═══════════════════════════════════════════
   Sidebar section definitions
   ═══════════════════════════════════════════ */
const sidebarSections = [
  { id: 'vision-mission', label: 'Vision & Mission', icon: Eye },
  { id: 'chairman-message', label: "Chairman's Message", icon: Users },
  { id: 'dean-message', label: "Dean's Message", icon: BookOpen },
  { id: 'accreditations', label: 'Accreditations & Approvals', icon: Award },
  { id: 'rankings', label: 'Rankings', icon: TrendingUp },
] as const

/* ═══════════════════════════════════════════
   Main About Page
   ═══════════════════════════════════════════ */
const AboutPage = () => {
  const [activeSection, setActiveSection] = useState<string>('vision-mission')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  /* ── Intersection Observer for active sidebar tracking ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    )

    for (const section of sidebarSections) {
      const el = sectionRefs.current[section.id]
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current[id]
    if (el) {
      const yOffset = -90
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, [])

  const setRef = useCallback((id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el
  }, [])

  return (
    <div className="min-h-screen bg-[#edf2ff] text-slate-900">
      <LandingHeader />

      {/* ══════════ Hero Banner ══════════ */}
      <div className="relative h-56 overflow-hidden md:h-64">
        <img
          src={heroBg}
          alt="JIMS Campus"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-jimsBlue/90 to-indigo-900/80" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-sm font-medium uppercase tracking-wider text-blue-200"
          >
            About Us
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-3xl font-bold text-white md:text-4xl lg:text-5xl"
          >
            Jagan Institute of Management Studies
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base"
          >
            Sector-5, Rohini, Delhi — Affiliated to GGSIP University | NAAC A++ | NBA Accredited
          </motion.p>
        </div>
      </div>

      {/* ══════════ Breadcrumb ══════════ */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-6 py-3 text-sm text-slate-500 md:px-10">
          <Link to="/" className="flex items-center gap-1 transition-colors hover:text-jimsBlue">
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-800">About Us</span>
        </div>
      </div>

      {/* ══════════ Main Grid: Content + Sidebar ══════════ */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-10 lg:grid-cols-[1fr_300px]">
        {/* ── LEFT: Main Content ── */}
        <div className="space-y-10">
          {/* ─── Vision & Mission ─── */}
          <section id="vision-mission" ref={setRef('vision-mission')}>
            <SectionTitle icon={Eye} title="Vision and Mission of the Institute" />

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <ContentCard
                title="Our Vision"
                icon={Eye}
                color="blue"
                content="To be an Institute of Academic Excellence with total commitment to quality education and research in Management and Information Technology with a holistic concern for better life, environment and society."
              />
              <ContentCard
                title="Our Mission"
                icon={Target}
                color="indigo"
                content="To serve the society and improve the quality of life by imparting high quality education in management and information technology, providing training and development services, fostering research, giving consultancy services to industry and disseminating knowledge through the publication of books, journals and magazines."
              />
            </div>

            <div className="mt-5">
              <ContentCard
                title="Quality Policy"
                icon={ShieldCheck}
                color="emerald"
                content="We, at Jagan Institute of Management Studies are committed to provide quality technical education, bearing in mind expressed and implied needs of the students, industry and society. We aim at providing, on a permanent basis, facilities for the students to achieve academic excellence for employability as world class managers and entrepreneurs. Apart from a teaching institution, we aim at enhancing our research and development efforts. As an 'A++' grade NAAC accredited institution, we have set up an Internal Quality Assurance Cell (IQAC) to ensure continuous improvement."
              />
            </div>
          </section>

          {/* ─── Chairman's Message ─── */}
          <section id="chairman-message" ref={setRef('chairman-message')}>
            <SectionTitle icon={Users} title="Chairman's Message" />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45 }}
              className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 bg-gradient-to-r from-jimsBlue to-indigo-700 px-6 py-4">
                <h3 className="text-lg font-bold text-white">Manish Gupta</h3>
                <p className="text-sm text-blue-200">Chairman, JIMS</p>
              </div>
              <div className="space-y-4 px-6 py-5 text-sm leading-relaxed text-slate-600">
                <p>
                  JIMS has been working for the attainment of a mission i.e. to develop highly skilled and professional human resource for industry and business. We have created a niche in 30 years in the fields of Management and Information Technology. Our pedagogies are unique and accepted by the industry.
                </p>
                <p>
                  We had started JIMS, keeping some of the leading institutions as our benchmarks but today we take this pride to be a benchmark for other institutions to follow. We have evolved and developed extensive modern teaching methodologies that transforms ideological thinking to practical thinking that lead to ideas that are out of the box and triggers creativity.
                </p>
                <p>
                  We understand that management education is ever-changing and ever-evolving. On these lines we focus and frequently interact with the industry to know our employer expectations. This has enabled repeated arrival of companies for campus recruitments year after year. Our rich alumni base has also proved our 30 years of fruitful interactive existence.
                </p>
                <p>
                  Our determination, conviction and perseverance have helped us to keep our roots intact. On the completion of our 30th year of academic excellence we renew our commitment to uplift the standards of education and we welcome all the students to join JIMS with high spirits, right focus and vision to excel.
                </p>
              </div>
            </motion.div>
          </section>

          {/* ─── Dean's Message ─── */}
          <section id="dean-message" ref={setRef('dean-message')}>
            <SectionTitle icon={BookOpen} title="Dean's Message" />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45 }}
              className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 bg-gradient-to-r from-teal-600 to-emerald-700 px-6 py-4">
                <h3 className="text-lg font-bold text-white">Dr. Praveen Arora</h3>
                <p className="text-sm text-teal-100">Dean / Principal, JIMS</p>
              </div>
              <div className="space-y-4 px-6 py-5 text-sm leading-relaxed text-slate-600">
                <p>
                  Having a legacy of imparting quality education since last 30 years, JIMS is a well-established name in the field of management & IT education. Our GGSIP University affiliated programs MCA, BBA and BCA are associated with the University since inception. We added another industry-oriented program B.A. (Hons.) Economics two years ago. The MCA programme is accredited by National Board of Accreditation (NBA). The National Assessment and Accreditation Council (NAAC) has accredited JIMS at A++ grade.
                </p>
                <p>
                  All the initiatives and activities in the institute are guided by our vision of being an Institute of Academic Excellence with total commitment to quality education and research. We continuously strive to impart professional education and produce industry ready professionals in the field of management and information technology.
                </p>
                <p>
                  At JIMS, we focus on the holistic development of every student by providing real work life exposure extending beyond the textbook bound curriculum in the form of internships, assignments and live projects which are conducted in close association with industry experts. All our faculty members are very experienced and hold excellent credentials in their respective fields.
                </p>
                <p>
                  The institute has earned many prestigious accreditations by various govt bodies which further reinstates the fact that we are moving ahead in the right direction.
                </p>
              </div>
            </motion.div>
          </section>

          {/* ─── Accreditations & Approvals ─── */}
          <section id="accreditations" ref={setRef('accreditations')}>
            <SectionTitle icon={Award} title="Accreditations & Approvals" />

            <div className="mt-5 space-y-4">
              <AccreditationCard
                title="NBA Accredited"
                description="MCA Programmes are accredited from National Board of Accreditation (NBA) for excellence in quality education."
                badge="NBA"
                color="blue"
              />
              <AccreditationCard
                title="NAAC A++ Grade"
                description="The National Assessment and Accreditation Council has accredited JIMS as 'A++' grade, which is a highly prestigious Government accreditation."
                badge="A++"
                color="amber"
              />
              <AccreditationCard
                title="SAQS Accredited"
                description="JIMS is among the few top B schools to receive this for excellence in imparting quality education. This gives JIMS an edge to attain greater international visibility especially among the South Asian Countries."
                badge="SAQS"
                color="rose"
              />
              <AccreditationCard
                title="AICTE Approved"
                description="The Postgraduate program MCA is approved by the All India Council for Technical Education (AICTE)."
                badge="AICTE"
                color="emerald"
              />
              <AccreditationCard
                title="GGSIPU Affiliated"
                description="MCA, BBA, BCA and B.A Economics(H) are affiliated by Guru Gobind Singh Indraprastha University, Delhi."
                badge="GGSIPU"
                color="purple"
              />
            </div>
          </section>

          {/* ─── Rankings ─── */}
          <section id="rankings" ref={setRef('rankings')}>
            <SectionTitle icon={TrendingUp} title="Rankings" />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <RankingCard
                title="NIRF Ranked"
                description="JIMS Rohini continues to maintain a place among the top 100 institutions of India in the management category for the 9th year in a row. NIRF 2024, Ministry of Education, Government of India."
                highlight="Top 100"
              />
              <RankingCard
                title="ARIIA Ranked"
                description="JIMS ranked among top 50 private institutes in ARIIA ranking for Innovation, Entrepreneurship and Incubation on all India basis, 2020."
                highlight="Top 50"
              />
              <RankingCard
                title="Times of India"
                description="JIMS Rohini Ranked 15th Among top 100 B Schools in India by TOI, 9th in Private B Schools, 6th in North India in 2024."
                highlight="#15"
              />
            </div>
          </section>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Contact Box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="bg-gradient-to-r from-jimsBlue to-indigo-700 px-5 py-3.5">
              <h3 className="text-sm font-bold text-white">JIMS Contact Info</h3>
            </div>
            <div className="space-y-3 px-5 py-4">
              <ContactRow icon={Phone} text="+91-7827938610" />
              <ContactRow icon={Mail} text="contact@jimsindia.org" />
              <ContactRow
                icon={MapPin}
                text="3, Institutional Area, Sector-5, Rohini, Delhi-110085"
              />
              <ContactRow icon={Globe} text="www.jimsindia.org" />
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 px-5 py-3.5">
              <h3 className="text-sm font-bold text-slate-800">Quick Navigation</h3>
            </div>
            <nav className="p-2">
              {sidebarSections.map((section) => {
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 font-semibold text-jimsBlue shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <section.icon
                      className={`h-4 w-4 shrink-0 ${isActive ? 'text-jimsBlue' : 'text-slate-400'}`}
                    />
                    {section.label}
                    {isActive && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-jimsBlue" />
                    )}
                  </button>
                )
              })}
            </nav>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-jimsBlue to-indigo-700 p-5 shadow-sm"
          >
            <h3 className="mb-4 text-sm font-bold text-white">At a Glance</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Years Legacy', value: '30+' },
                { label: 'NAAC Grade', value: 'A++' },
                { label: 'NIRF Years', value: '9th' },
                { label: 'Programs', value: '4' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-white/15 px-3 py-2.5 text-center backdrop-blur-sm"
                >
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-blue-200">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </aside>
      </div>

      <LandingFooter />
    </div>
  )
}

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

const SectionTitle = ({
  icon: Icon,
  title,
}: {
  icon: typeof Eye
  title: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.4 }}
    className="flex items-center gap-2.5"
  >
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-jimsBlue/10">
      <Icon className="h-4.5 w-4.5 text-jimsBlue" />
    </div>
    <h2 className="text-xl font-bold text-slate-900 md:text-2xl">{title}</h2>
  </motion.div>
)

const ContentCard = ({
  title,
  icon: Icon,
  color,
  content,
}: {
  title: string
  icon: typeof Eye
  color: string
  content: string
}) => {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600 border-blue-200',
    indigo: 'from-indigo-500 to-indigo-600 border-indigo-200',
    emerald: 'from-emerald-500 to-emerald-600 border-emerald-200',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${colorMap[color]?.split(' ')[2] || 'border-slate-200'}`}
    >
      <div className={`bg-gradient-to-r ${colorMap[color]?.split(' ').slice(0, 2).join(' ')} px-5 py-3`}>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-white/90" />
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed text-slate-600">{content}</p>
      </div>
    </motion.div>
  )
}

const AccreditationCard = ({
  title,
  description,
  badge,
  color,
}: {
  title: string
  description: string
  badge: string
  color: string
}) => {
  const colorMap: Record<string, { border: string; bg: string; text: string }> = {
    blue: { border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
    amber: { border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
    rose: { border: 'border-l-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' },
    emerald: { border: 'border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    purple: { border: 'border-l-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
  }

  const c = colorMap[color] || colorMap.blue

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      className={`flex items-start gap-4 rounded-xl border border-slate-200 border-l-4 ${c.border} bg-white p-5 shadow-sm transition-all hover:shadow-md`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
        <span className={`text-xs font-extrabold ${c.text}`}>{badge}</span>
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
    </motion.div>
  )
}

const RankingCard = ({
  title,
  description,
  highlight,
}: {
  title: string
  description: string
  highlight: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.45 }}
    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
  >
    <div className="flex items-start gap-4 p-5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-jimsBlue to-indigo-600 shadow-md">
        <span className="text-lg font-extrabold text-white">{highlight}</span>
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  </motion.div>
)

const ContactRow = ({ icon: Icon, text }: { icon: typeof Phone; text: string }) => (
  <div className="flex items-start gap-2.5">
    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-jimsBlue" />
    <span className="text-xs leading-snug text-slate-600">{text}</span>
  </div>
)

export default AboutPage
