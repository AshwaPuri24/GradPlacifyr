import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface QuickActionCardProps {
  to: string
  title: string
  description: string
  icon: LucideIcon
  /** When provided the card renders as a button and calls this handler instead of navigating via `to`. */
  onClick?: () => void
}

const QuickActionCard = ({ to, title, description, icon: Icon, onClick }: QuickActionCardProps) => {
  const inner = (
    <>
      <div className="quick-action-icon-wrap">
        <span className="quick-action-icon">
          <Icon size={24} strokeWidth={2} />
        </span>
      </div>
      <div className="quick-action-body">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="quick-action-arrow-wrap">
        <ArrowRight size={14} strokeWidth={2.5} className="quick-action-arrow" />
      </div>
    </>
  )

  return (
    <motion.div
      className="quick-action-card-wrap"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
    >
      {onClick ? (
        <button className="quick-action-card quick-action-card-compact" onClick={onClick} type="button">
          {inner}
        </button>
      ) : (
        <Link className="quick-action-card quick-action-card-compact" to={to}>
          {inner}
        </Link>
      )}
    </motion.div>
  )
}

export default QuickActionCard
