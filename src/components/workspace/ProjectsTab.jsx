import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createProject, deleteProject, listProjects, updateProject } from '../../api/projects.js'
import Modal from '../ui/Modal.jsx'
import { Empty, ErrorBanner, Loader } from '../ui/Feedback.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { emptyToNull } from '../../utils/format.js'
import { can } from '../../utils/permissions.js'

export default function ProjectsTab({ workspace }) {
  const { data: projects, loading, error, reload } = useAsync(() => listProjects(workspace.id), [workspace.id])
  const [editing, setEditing] = useState(null) // null | 'new' | project
  const [actionError, setActionError] = useState('')
  const canManage = can.manageProjects(workspace.role)

  async function remove(project) {
    if (!window.confirm(`Supprimer le projet « ${project.name} » et toutes ses tâches ?`)) return
    try {
      await deleteProject(project.id)
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <div className="row-between">
        <h2>Projets</h2>
        {canManage && <button onClick={() => setEditing('new')}>+ Nouveau projet</button>}
      </div>
      <ErrorBanner message={error || actionError} />
      {loading && <Loader />}
      {projects?.length === 0 && <Empty>Aucun projet pour l’instant.</Empty>}

      <div className="grid">
        {projects?.map((p) => (
          <div key={p.id} className="card-link">
            <Link to={`/projects/${p.id}`} className="plain">
              <h3>{p.name}</h3>
              <p className="muted">{p.description || 'Aucune description'}</p>
            </Link>
            {canManage && (
              <div className="actions">
                <button className="btn-ghost" onClick={() => setEditing(p)}>Modifier</button>
                <button className="btn-ghost danger" onClick={() => remove(p)}>Supprimer</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <ProjectFormModal
          workspaceId={workspace.id}
          project={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            reload()
          }}
        />
      )}
    </>
  )
}

function ProjectFormModal({ workspaceId, project, onClose, onSaved }) {
  const [name, setName] = useState(project?.name ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const data = { name: name.trim(), description: emptyToNull(description) }
    try {
      if (project) await updateProject(project.id, data)
      else await createProject(workspaceId, data)
      onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title={project ? 'Modifier le projet' : 'Nouveau projet'} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <ErrorBanner message={error} />
        <label>Nom<input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} required autoFocus /></label>
        <label>Description<textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} /></label>
        <button disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
      </form>
    </Modal>
  )
}
