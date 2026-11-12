import { useState } from 'react'
import { createTask, updateTask } from '../../api/tasks.js'
import { PRIORITIES } from '../../constants/enums.js'
import Modal from '../ui/Modal.jsx'
import { ErrorBanner } from '../ui/Feedback.jsx'
import { emptyToNull } from '../../utils/format.js'

/** Création (projectId) ou modification (task). `members` alimente la liste des assignés possibles. */
export default function TaskFormModal({ projectId, task, members, onClose, onSaved }) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState(task?.priority ?? 'MEDIUM')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [assigneeEmail, setAssigneeEmail] = useState(task?.assignee?.email ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const data = {
      title: title.trim(),
      description: emptyToNull(description),
      priority,
      dueDate: dueDate || null,
      assigneeEmail: assigneeEmail || null,
    }
    try {
      if (task) await updateTask(task.id, data)
      else await createTask(projectId, data)
      onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title={task ? 'Modifier la tâche' : 'Nouvelle tâche'} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <ErrorBanner message={error} />
        <label>Titre<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required autoFocus /></label>
        <label>Description<textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={4000} /></label>
        <div className="row">
          <label className="grow">Priorité
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </label>
          <label className="grow">Échéance
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
        </div>
        <label>Assignée à
          <select value={assigneeEmail} onChange={(e) => setAssigneeEmail(e.target.value)}>
            <option value="">— Personne —</option>
            {members.map((m) => <option key={m.id} value={m.user.email}>{m.user.name} ({m.user.email})</option>)}
          </select>
        </label>
        <button disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
      </form>
    </Modal>
  )
}
