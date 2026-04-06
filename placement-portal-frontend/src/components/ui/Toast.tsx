import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Role } from '../../context/AuthContext'
import { getRoleTheme } from '../../utils/roleConfig'

/* ── Types ── */
interface ToastData {
  id: number
  message: string
  role?: Role
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, role?: Role, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

/* ── Single toast item ── */
const ToastItem = ({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) => {
  const theme = toast.role ? getRoleTheme(toast.role) : null
  const Icon = theme?.icon

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration ?? 3500)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        background: theme ? theme.accentLight : '#f0fdf4',
        border: `1px solid ${theme ? theme.accent + '30' : '#bbf7d0'}`,
        color: theme ? theme.accent : '#166534',
      }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium pointer-events-auto cursor-pointer backdrop-blur-sm"
      onClick={() => onDismiss(toast.id)}
    >
      {Icon && <Icon size={18} strokeWidth={2.2} />}
      <span>{toast.message}</span>
    </motion.div>
  )
}

/* ── Provider + container ── */
let _nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback((message: string, role?: Role, duration?: number) => {
    const id = ++_nextId
    setToasts((prev) => [...prev, { id, message, role, duration }])
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast portal — fixed top-center */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
