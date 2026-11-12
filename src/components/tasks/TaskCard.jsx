import { PriorityBadge } from '../ui/Badge.jsx'
import { formatDate, isOverdue } from '../../utils/format.js'

export default function TaskCard({ task, onOpen }) {
  return (
    <button className="task-card" onClick={() => onOpen(task.id)}>
      <span className="task-title">{task.title}</span>
      <span className="task-meta">
        <PriorityBadge value={task.priority} />
        {task.dueDate && (
          <span className={isOverdue(task) ? 'due overdue' : 'due'}>{formatDate(task.dueDate)}</span>
        )}
      </span>
      {task.assignee && <span className="muted small">👤 {task.assignee.name}</span>}
    </button>
  )
}
