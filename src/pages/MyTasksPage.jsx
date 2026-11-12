import { useState } from 'react'
import { Link } from 'react-router-dom'
import { myTasks } from '../api/tasks.js'
import TaskDetailModal from '../components/tasks/TaskDetailModal.jsx'
import { PriorityBadge, StatusBadge } from '../components/ui/Badge.jsx'
import { Empty, ErrorBanner, Loader } from '../components/ui/Feedback.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { formatDate, isOverdue } from '../utils/format.js'

export default function MyTasksPage() {
  const { data: tasks, loading, error, reload } = useAsync(myTasks, [])
  const [hideDone, setHideDone] = useState(true)
  const [openTaskId, setOpenTaskId] = useState(null)

  const visible = tasks?.filter((t) => !hideDone || t.status !== 'DONE')

  return (
    <>
      <div className="page-head">
        <h1>Mes tâches</h1>
        <label className="check">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
          Masquer les tâches terminées
        </label>
      </div>

      <ErrorBanner message={error} />
      {loading && !tasks && <Loader />}
      {visible?.length === 0 && <Empty>Aucune tâche ne t’est assignée.</Empty>}

      {visible?.length > 0 && (
        <table className="table">
          <thead>
            <tr><th>Tâche</th><th>Priorité</th><th>Statut</th><th>Échéance</th><th /></tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr key={t.id}>
                <td><button className="link-btn" onClick={() => setOpenTaskId(t.id)}>{t.title}</button></td>
                <td><PriorityBadge value={t.priority} /></td>
                <td><StatusBadge value={t.status} /></td>
                <td className={isOverdue(t) ? 'overdue' : ''}>{t.dueDate ? formatDate(t.dueDate) : '—'}</td>
                <td className="right"><Link to={`/projects/${t.projectId}`}>Voir le projet</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {openTaskId && <TaskDetailModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} onChanged={reload} />}
    </>
  )
}
