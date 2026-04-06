import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, BriefcaseBusiness, GraduationCap, ShieldCheck } from 'lucide-react'
import heroBg from '../../assets/hero-bg.jpg'

const floatingCards = [
  { title: 'Students', value: '500+', icon: GraduationCap },
  { title: 'Companies', value: '120+', icon: BriefcaseBusiness },
  { title: 'Offers', value: '300+', icon: BarChart3 },
  { title: 'Placement Rate', value: '95%', icon: ShieldCheck },
]

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* ── Background image — center-top keeps building & JIMS logo visible ── */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundPosition: 'center top',
        }}
      />

      {/* ── Very light directional overlay — dark only on left for text ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent" />

      {/* ── Bottom fade for smooth section transition ── */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />

      {/* ── Content grid ── */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-6 pb-24 pt-24 md:px-12 md:pb-32 lg:grid-cols-2 lg:px-16 xl:px-20">
        {/* ── LEFT: Text directly on background — NO box, NO blur ── */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl space-y-5"
        >
          <h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow-md md:text-5xl xl:text-6xl">
            Empowering Careers,
            <br />
            <span className="text-amber-400 drop-shadow-md">Building Futures</span>
          </h1>

          <p className="max-w-md text-base leading-relaxed text-gray-200 drop-shadow-sm md:text-lg">
            A centralized platform for students, recruiters, and TPOs to manage
            campus placements efficiently.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/register"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-amber-400 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 hover:brightness-110"
              >
                Get Started
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/login"
                className="inline-flex items-center rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/60"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ── RIGHT: Dashboard card — pushed far right ── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative flex justify-end"
        >
          <div className="w-full max-w-[420px]">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-lg md:p-7">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Live Dashboard Snapshot</p>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {floatingCards.map((card) => (
                  <div
                    key={card.title}
                    className="group rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/25"
                  >
                    <card.icon className="mb-2 h-5 w-5 text-blue-300 transition-colors group-hover:text-blue-200" />
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                    <p className="text-sm text-gray-300">{card.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -bottom-5 right-0 rounded-2xl border border-white/20 bg-white/10 p-3.5 shadow-xl backdrop-blur-lg animate-float md:-right-4"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-amber-400">Next Drive</p>
              <p className="text-sm font-medium text-white">12 Companies this month</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
