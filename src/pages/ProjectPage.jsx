import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProject } from '../api/projects.js'
import { listTasks } from '../api/tasks.js'
import { getWorkspace, listMembers } from '../api/workspaces.js'
import TaskCard from '../components/tasks/TaskCard.jsx'
import TaskDetailModal from '../components/tasks/TaskDetailModal.jsx'
import TaskFormModal from '../components/tasks/TaskFormModal.jsx'
import { Empty, ErrorBanner, Loader } from '../components/ui/Feedback.jsx'
import { PRIORITIES, STATUSES } from '../constants/enums.js'
import { useAsync } from '../hooks/useAsync.js'

async function loadProject(id) {
  const project = await getProject(id)
  const [workspace, members] = await Promise.all([getWorkspace(project.workspaceId), listMembers(project.workspaceId)])
  return { project, workspace, members }
}

export default function ProjectPage() {
  const { id } = useParams()
  const [priority, setPriority] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [creating, setCreating] = useState(false)
  const [openTaskId, setOpenTaskId] = useState(null)

  const ctx = useAsync(() => loadProject(id), [id])
  // Les filtres sont appliqués par le back (?priority=&assigneeId=) : la requête repart à chaque changement.
  const tasks = useAsync(() => listTasks(id, { priority, assigneeId }), [id, priority, assigneeId])

  if (ctx.loading && !ctx.data) return <Loader />
  if (ctx.error) return (<><ErrorBanner message={ctx.error} /><Link to="/">← Retour</Link></>)
  if (!ctx.data) return null

  const { project, workspace, members } = ctx.data

  return (
    <>
      <Link to={`/workspaces/${workspace.id}`} className="back">← {workspace.name}</Link>
      <div className="page-head">
        <div>
          <h1>{project.name}</h1>
          {project.description && <p className="muted">{project.description}</p>}
        </div>
        <button onClick={() => setCreating(true)}>+ Nouvelle tâche</button>
      </div>

      <div className="filters">
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">Toutes priorités</option>
          {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
          <option value="">Tous les assignés</option>
          {members.map((m) => <option key={m.id} value={m.user.id}>{m.user.name}</option>)}
        </select>
      </div>

      <ErrorBanner message={tasks.error} />
      {tasks.loading && !tasks.data && <Loader />}

      {tasks.data && (
        <div className="board">
          {STATUSES.map((s) => {
            const column = tasks.data.filter((t) => t.status === s.value)
            return (
              <section key={s.value} className="column">
                <h3>{s.label} <span className="count">{column.length}</span></h3>
                {column.length === 0 && <Empty>Vide</Empty>}
                {column.map((t) => <TaskCard key={t.id} task={t} onOpen={setOpenTaskId} />)}
              </section>
            )
          })}
        </div>
      )}

      {creating && (
        <TaskFormModal projectId={project.id} members={members} onClose={() => setCreating(false)}
                       onSaved={() => { setCreating(false); tasks.reload() }} />
      )}
      {openTaskId && (
        <TaskDetailModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} onChanged={tasks.reload} />
      )}
    </>
  )
}
