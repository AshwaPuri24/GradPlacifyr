import { Lightbulb, Sparkles, TrendingUp, Zap, Target, AlertTriangle, Info } from 'lucide-react'
import { ChevronRight } from 'lucide-react'

export interface SuggestionItem {
  id: string
  title: string
  detail: string
  priority?: 'high' | 'medium' | 'low'
}

interface SuggestionPanelProps {
  title?: string
  items: SuggestionItem[]
}

const SuggestionPanel = ({ title = 'Admin Intelligence', items }: SuggestionPanelProps) => {
  if (items.length === 0) {
    return (
      <div className="suggestion-panel">
        <div className="suggestion-head">
          <Sparkles size={16} className="text-purple-600" />
          <h3>{title}</h3>
        </div>
        <p className="dashboard-empty">Scanning platform for insights...</p>
      </div>
    )
  }

  return (
    <div className="suggestion-panel-enhanced">
      <div className="suggestion-head">
        <Zap size={18} className="text-amber-500" />
        <h3>{title}</h3>
      </div>
      <ul className="intel-list">
        {items.map((item, idx) => {
          const Icon =
            item.priority === 'high' ? AlertTriangle
            : item.priority === 'medium' ? TrendingUp
            : idx === 0 ? Target
            : idx === 2 ? Zap
            : idx === 4 ? Info
            : Lightbulb
          const pillLabel =
            item.priority === 'high' ? 'High Priority'
            : item.priority === 'medium' ? 'Medium'
            : item.priority === 'low' ? 'Informational'
            : null
          return (
            <li key={item.id} className="intel-card">
              <div className="intel-icon-wrap">
                <Icon size={16} />
              </div>
              <div className="intel-body">
                <div className="intel-title-row">
                  <h4>{item.title}</h4>
                  {pillLabel && (
                    <span className={`intel-priority-pill intel-priority-${item.priority ?? 'low'}`}>
                      {pillLabel}
                    </span>
                  )}
                </div>
                <p>{item.detail}</p>
              </div>
              <ChevronRight size={14} className="intel-arrow" />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SuggestionPanel
