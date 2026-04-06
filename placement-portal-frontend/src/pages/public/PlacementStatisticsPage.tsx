import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import LandingHeader from '../../components/landing/LandingHeader'
import PlacementStatistics from '../../components/landing/PlacementStatistics'
import LandingFooter from '../../components/landing/LandingFooter'

const PlacementStatisticsPage = () => {
  /* Scroll to top on mount */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  return (
    <div className="min-h-screen bg-[#edf2ff] text-slate-900">
      <LandingHeader />

      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-8">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500">
          <Link
            to="/"
            className="flex items-center gap-1 transition-colors hover:text-jimsBlue"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-800">Placement Statistics</span>
        </nav>
      </div>

      <main>
        <PlacementStatistics />
      </main>

      <LandingFooter />
    </div>
  )
}

export default PlacementStatisticsPage
