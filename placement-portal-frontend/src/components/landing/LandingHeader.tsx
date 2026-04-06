import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import jimsLogo from '../../assets/jims-logo.png'

const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Process', to: '/recruitment-process' },
  { label: 'Statistics', to: '/placement-statistics' },
  { label: 'Contact', to: '/contact' },
  { label: 'Role Selection', to: '/role-selection' },
]

const LandingHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
      <div className="flex w-full items-center justify-between px-6 py-3 lg:px-10 xl:px-16">
        {/* ── Logo — far left ── */}
        <Link to="/" className="flex shrink-0 items-center">
          <img
            src={jimsLogo}
            alt="JIMS Rohini Sector-5"
            className="h-12 w-auto object-contain md:h-14"
          />
        </Link>

        {/* ── Desktop navigation — far right ── */}
        <nav className="ml-auto hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-slate-700 transition-colors duration-200 hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ── Mobile hamburger — far right ── */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="ml-auto flex items-center justify-center rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* ── Mobile menu dropdown ── */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-6 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

export default LandingHeader
