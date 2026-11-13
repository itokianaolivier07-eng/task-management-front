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
      setError(err.message) // message du back (409 : compte impossible à créer, 400 : validation, 429 : trop de tentatives)
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
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={255} required autoFocus />
        </label>
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 autoComplete="email" maxLength={255} required />
        </label>
        <label>
          Mot de passe (8 à 72 caractères)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 autoComplete="new-password" minLength={8} maxLength={72} required />
        </label>

        <button type="submit" disabled={loading}>{loading ? 'Création…' : 'S’inscrire'}</button>
        <p className="muted">Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
      </form>
    </main>
  )
}
