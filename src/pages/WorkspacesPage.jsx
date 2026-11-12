import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createWorkspace, listWorkspaces } from '../api/workspaces.js'
import Modal from '../components/ui/Modal.jsx'
import { Empty, ErrorBanner, Loader } from '../components/ui/Feedback.jsx'
import { RoleBadge } from '../components/ui/Badge.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { emptyToNull } from '../utils/format.js'

export default function WorkspacesPage() {
  const { data: workspaces, loading, error, reload } = useAsync(listWorkspaces, [])
  const [creating, setCreating] = useState(false)

  return (
    <>
      <div className="page-head">
        <h1>Mes workspaces</h1>
        <button onClick={() => setCreating(true)}>+ Nouveau workspace</button>
      </div>

      <ErrorBanner message={error} />
      {loading && <Loader />}
      {workspaces?.length === 0 && <Empty>Tu n’as aucun workspace. Crées-en un pour commencer.</Empty>}

      <div className="grid">
        {workspaces?.map((w) => (
          <Link key={w.id} to={`/workspaces/${w.id}`} className="card-link">
            <div className="row-between">
              <h3>{w.name}</h3>
              <RoleBadge value={w.role} />
            </div>
            <p className="muted">{w.description || 'Aucune description'}</p>
          </Link>
        ))}
      </div>

      {creating && (
        <WorkspaceFormModal
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            reload()
          }}
        />
      )}
    </>
  )
}

function WorkspaceFormModal({ onClose, onSaved }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createWorkspace({ name: name.trim(), description: emptyToNull(description) })
      onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title="Nouveau workspace" onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <ErrorBanner message={error} />
        <label>Nom<input value={name} onChange={(e) => setName(e.target.value)} required autoFocus /></label>
        <label>Description<textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <button disabled={saving}>{saving ? 'Création…' : 'Créer'}</button>
      </form>
    </Modal>
  )
}
