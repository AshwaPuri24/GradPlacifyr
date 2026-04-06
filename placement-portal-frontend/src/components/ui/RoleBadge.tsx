import type { Role } from '../../context/AuthContext'
import { getRoleTheme } from '../../utils/roleConfig'

interface RoleBadgeProps {
  role: Role
  /** 'sm' = compact, 'md' = regular */
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Displays a coloured pill with the role icon + label.
 * Uses inline styles derived from the role theme accent colours.
 */
const RoleBadge = ({ role, size = 'sm', className = '' }: RoleBadgeProps) => {
  const theme = getRoleTheme(role)
  const Icon = theme.icon

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-xs gap-1.5'
      : 'px-3 py-1 text-sm gap-2'

  const iconSize = size === 'sm' ? 13 : 16

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizeClasses} ${className}`}
      style={{ background: theme.accentLight, color: theme.accent }}
    >
      <Icon size={iconSize} strokeWidth={2.2} />
      {theme.label}
    </span>
  )
}

export default RoleBadge
