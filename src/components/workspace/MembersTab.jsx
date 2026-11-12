import { useState } from 'react'
import { addMember, listMembers, removeMember, updateMemberRole } from '../../api/workspaces.js'
import { ASSIGNABLE_ROLES } from '../../constants/enums.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { RoleBadge } from '../ui/Badge.jsx'
import { ErrorBanner, Loader } from '../ui/Feedback.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { can } from '../../utils/permissions.js'

export default function MembersTab({ workspace }) {
  const { user } = useAuth()
  const { data: members, loading, error, reload } = useAsync(() => listMembers(workspace.id), [workspace.id])
  const [actionError, setActionError] = useState('')

  // Petite enveloppe : exécute une action, recharge la liste, affiche l'erreur éventuelle du back.
  async function run(action) {
    setActionError('')
    try {
      await action()
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <h2>Membres</h2>
      <ErrorBanner message={error || actionError} />
      {loading && !members && <Loader />}

      {members && (
        <table className="table">
          <thead>
            <tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th /></tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.user.name}{m.user.email === user.email && <span className="muted"> (toi)</span>}</td>
                <td>{m.user.email}</td>
                <td>
                  {can.changeRoles(workspace.role) && m.role !== 'OWNER' ? (
                    <select value={m.role}
                            onChange={(e) => run(() => updateMemberRole(workspace.id, m.id, e.target.value))}>
                      {ASSIGNABLE_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  ) : (
                    <RoleBadge value={m.role} />
                  )}
                </td>
                <td className="right">
                  {can.removeMember(workspace.role, m.role) && (
                    <button className="btn-ghost danger"
                            onClick={() =>
                              window.confirm(`Retirer ${m.user.name} du workspace ?`) &&
                              run(() => removeMember(workspace.id, m.id))
                            }>
                      Retirer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {can.manageWorkspace(workspace.role) && (
        <InviteForm onInvite={(email, role) => run(() => addMember(workspace.id, email, role))} />
      )}
    </>
  )
}

function InviteForm({ onInvite }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('MEMBER')

  async function submit(e) {
    e.preventDefault()
    await onInvite(email.trim(), role)
    setEmail('')
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <h3>Inviter un membre</h3>
      <p className="muted">La personne doit déjà avoir un compte TaskFlow.</p>
      <div className="row">
        <input type="email" placeholder="e-mail du membre" value={email}
               onChange={(e) => setEmail(e.target.value)} required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {ASSIGNABLE_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <button>Inviter</button>
      </div>
    </form>
  )
}
