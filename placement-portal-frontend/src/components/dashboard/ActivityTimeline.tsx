import { CheckCircle2, AlertCircle, Info, Clock } from 'lucide-react'

export interface TimelineItem {
  id: string | number
  title: string
  description: string
  time: string
  tone?: 'default' | 'success' | 'warning'
}

interface ActivityTimelineProps {
  items: TimelineItem[]
  emptyText: string
}

const ActivityTimeline = ({ items, emptyText }: ActivityTimelineProps) => {
  if (items.length === 0) {
    return <p className="dashboard-empty">{emptyText}</p>
  }

  return (
    <ul className="activity-timeline-enhanced">
      {items.map((item) => {
        const Icon = item.tone === 'success' ? CheckCircle2 : item.tone === 'warning' ? AlertCircle : Info
        return (
          <li key={item.id} className={`activity-row activity-tone-${item.tone ?? 'default'}`}>
            <div className="activity-avatar">
              <Icon size={16} />
            </div>
            <div className="activity-main">
              <div className="activity-header">
                <h4>{item.title}</h4>
                <span className="activity-tag">{item.tone === 'success' ? 'Selected' : item.tone === 'warning' ? 'Process' : 'Update'}</span>
              </div>
              <p>{item.description}</p>
              <div className="activity-footer">
                <Clock size={10} />
                <time>{item.time}</time>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default ActivityTimeline
