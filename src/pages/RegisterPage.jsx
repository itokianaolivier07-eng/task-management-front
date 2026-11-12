import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name.trim(), email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message) // ex : "Cet e-mail est déjà utilisé" (409) ou erreur de validation (400)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Créer un compte</h1>
        {error && <p className="error" role="alert">{error}</p>}

        <label>
          Nom
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required autoFocus />
        </label>
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 autoComplete="email" required />
        </label>
        <label>
          Mot de passe (8 caractères minimum)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 autoComplete="new-password" minLength={8} required />
        </label>

        <button type="submit" disabled={loading}>{loading ? 'Création…' : 'S’inscrire'}</button>
        <p className="muted">Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
      </form>
    </main>
  )
}
