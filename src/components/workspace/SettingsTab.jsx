import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteWorkspace, updateWorkspace } from '../../api/workspaces.js'
import { ErrorBanner } from '../ui/Feedback.jsx'
import { emptyToNull } from '../../utils/format.js'
import { can } from '../../utils/permissions.js'

export default function SettingsTab({ workspace, onUpdated }) {
  const navigate = useNavigate()
  const [name, setName] = useState(workspace.name)
  const [description, setDescription] = useState(workspace.description ?? '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  if (!can.manageWorkspace(workspace.role)) {
    return <p className="muted">Seuls les propriétaires et administrateurs peuvent modifier ce workspace.</p>
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    setSaved(false)
    try {
      await updateWorkspace(workspace.id, { name: name.trim(), description: emptyToNull(description) })
      setSaved(true)
      onUpdated()
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove() {
    if (!window.confirm(`Supprimer définitivement « ${workspace.name} » (projets, tâches, commentaires) ?`)) return
    try {
      await deleteWorkspace(workspace.id)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <h2>Paramètres</h2>
      <form className="form narrow" onSubmit={save}>
        <ErrorBanner message={error} />
        {saved && <p className="success">Modifications enregistrées.</p>}
        <label>Nom<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Description<textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <button>Enregistrer</button>
      </form>

      {can.deleteWorkspace(workspace.role) && (
        <div className="danger-zone">
          <h3>Zone dangereuse</h3>
          <p className="muted">La suppression du workspace est définitive.</p>
          <button className="btn-danger" onClick={remove}>Supprimer le workspace</button>
        </div>
      )}
    </>
  )
}
