import { useState } from 'react'
import { getProject } from '../../api/projects.js'
import { deleteTask, getTask, updateTaskStatus } from '../../api/tasks.js'
import { getWorkspace, listMembers } from '../../api/workspaces.js'
import { STATUSES } from '../../constants/enums.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import Modal from '../ui/Modal.jsx'
import { ErrorBanner, Loader } from '../ui/Feedback.jsx'
import { PriorityBadge } from '../ui/Badge.jsx'
import CommentSection from './CommentSection.jsx'
import TaskFormModal from './TaskFormModal.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { formatDate, isOverdue } from '../../utils/format.js'
import { can } from '../../utils/permissions.js'

// Le modal est autonome : il retrouve lui-même la tâche, son projet, le workspace (donc MON rôle)
// et les membres. Il fonctionne donc pareil depuis un projet ou depuis « Mes tâches ».
async function loadContext(taskId) {
  const task = await getTask(taskId)
  const project = await getProject(task.projectId)
  const [workspace, members] = await Promise.all([getWorkspace(project.workspaceId), listMembers(project.workspaceId)])
  return { task, project, workspace, members }
}

export default function TaskDetailModal({ taskId, onClose, onChanged }) {
  const { user } = useAuth()
  const { data: ctx, loading, error, reload } = useAsync(() => loadContext(taskId), [taskId])
  const [editing, setEditing] = useState(false)
  const [actionError, setActionError] = useState('')

  async function changeStatus(status) {
    setActionError('')
    try {
      await updateTaskStatus(taskId, status)
      reload()
      onChanged()
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function remove() {
    if (!window.confirm('Supprimer cette tâche ?')) return
    try {
      await deleteTask(taskId)
      onChanged()
      onClose()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <Modal title={ctx?.task.title ?? 'Tâche'} onClose={onClose} wide>
      <ErrorBanner message={error || actionError} />
      {loading && !ctx && <Loader />}

      {ctx && (() => {
        const { task, project, workspace, members } = ctx
        const role = workspace.role
        const editable = can.editTask(role, task, user.email)
        return (
          <>
            <p className="muted small">{workspace.name} › {project.name}</p>
            <div className="task-detail-meta">
              <PriorityBadge value={task.priority} />
              <span>Statut :{' '}
                <select value={task.status} disabled={!editable} onChange={(e) => changeStatus(e.target.value)}>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </span>
              <span className={isOverdue(task) ? 'due overdue' : 'due'}>
                {task.dueDate ? `Échéance : ${formatDate(task.dueDate)}` : 'Pas d’échéance'}
              </span>
              <span>Assignée à : {task.assignee ? task.assignee.name : '—'}</span>
              <span className="muted">Créée par {task.createdBy?.name}</span>
            </div>

            <p className="pre">{task.description || <span className="muted">Pas de description.</span>}</p>

            <div className="actions">
              {editable && <button className="btn-ghost" onClick={() => setEditing(true)}>Modifier</button>}
              {can.deleteTask(role, task, user.email) && (
                <button className="btn-ghost danger" onClick={remove}>Supprimer</button>
              )}
            </div>

            <CommentSection taskId={task.id} role={role} />

            {editing && (
              <TaskFormModal task={task} members={members} onClose={() => setEditing(false)}
                             onSaved={() => { setEditing(false); reload(); onChanged() }} />
            )}
          </>
        )
      })()}
    </Modal>
  )
}
