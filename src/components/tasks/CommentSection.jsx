import { useState } from 'react'
import { addComment, deleteComment, listComments } from '../../api/comments.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { ErrorBanner, Loader } from '../ui/Feedback.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { formatDateTime } from '../../utils/format.js'
import { can } from '../../utils/permissions.js'

export default function CommentSection({ taskId, role }) {
  const { user } = useAuth()
  const { data: comments, loading, error, reload } = useAsync(() => listComments(taskId), [taskId])
  const [content, setContent] = useState('')
  const [actionError, setActionError] = useState('')
  const [sending, setSending] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    setActionError('')
    try {
      await addComment(taskId, content.trim())
      setContent('')
      reload()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSending(false)
    }
  }

  async function remove(id) {
    setActionError('')
    try {
      await deleteComment(id)
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <section className="comments">
      <h3>Commentaires</h3>
      <ErrorBanner message={error || actionError} />
      {loading && !comments && <Loader />}
      {comments?.length === 0 && <p className="muted">Aucun commentaire.</p>}

      <ul>
        {comments?.map((c) => (
          <li key={c.id}>
            <div className="row-between">
              <strong>{c.author.name}</strong>
              <span className="muted small">
                {formatDateTime(c.createdAt)}
                {can.deleteComment(role, c, user.email) && (
                  <button className="btn-ghost danger" onClick={() => remove(c.id)}>Supprimer</button>
                )}
              </span>
            </div>
            <p className="pre">{c.content}</p>
          </li>
        ))}
      </ul>

      <form className="form" onSubmit={submit}>
        <textarea rows={2} placeholder="Ajouter un commentaire…" value={content}
                  onChange={(e) => setContent(e.target.value)} maxLength={2000} />
        <button disabled={sending || !content.trim()}>Commenter</button>
      </form>
    </section>
  )
}
