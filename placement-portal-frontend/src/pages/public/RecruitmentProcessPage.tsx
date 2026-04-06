import LandingHeader from '../../components/landing/LandingHeader'
import ProcessSection from '../../components/landing/ProcessSection'
import LandingFooter from '../../components/landing/LandingFooter'

const RecruitmentProcessPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LandingHeader />
      <main>
        <ProcessSection />
      </main>
      <LandingFooter />
    </div>
  )
}

export default RecruitmentProcessPage
