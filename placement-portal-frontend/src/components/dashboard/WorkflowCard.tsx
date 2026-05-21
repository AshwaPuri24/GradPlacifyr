import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export type WorkflowCardColor = 'blue' | 'indigo' | 'teal' | 'amber' | 'purple' | 'cyan'

interface WorkflowCardProps {
  to: string
  title: string
  subtitle: string
  icon: LucideIcon
  color?: WorkflowCardColor
  onClick?: () => void
}

const WorkflowCard = ({
  to,
  title,
  subtitle,
  icon: Icon,
  color = 'blue',
  onClick,
}: WorkflowCardProps) => {
  const inner = (
    <>
      <div className={`wfc-icon wfc-icon--${color}`}>
        <Icon size={22} />
      </div>
      <div className="wfc-body">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <span className="wfc-arrow" aria-hidden="true">
        <ArrowRight size={15} />
      </span>
    </>
  )

  return (
    <motion.div
      className="wfc-wrap"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {onClick ? (
        <button className="wfc" onClick={onClick} type="button" aria-label={title}>
          {inner}
        </button>
      ) : (
        <Link className="wfc" to={to} aria-label={title}>
          {inner}
        </Link>
      )}
    </motion.div>
  )
}

export default WorkflowCard
