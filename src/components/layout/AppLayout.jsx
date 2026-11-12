import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { getMe } from '../../api/users.js'
import { useAuth } from '../../auth/AuthContext.jsx'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [name, setName] = useState('')

  // Le nom vient de /api/users/me (patch optionnel). Si l'endpoint n'existe pas : on garde l'e-mail.
  useEffect(() => {
    getMe().then((me) => setName(me.name)).catch(() => {})
  }, [])

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">TaskFlow</Link>
          <nav>
            <NavLink to="/" end>Workspaces</NavLink>
            <NavLink to="/my-tasks">Mes tâches</NavLink>
          </nav>
          <div className="topbar-user">
            <span title={user.email}>{name || user.email}</span>
            <button className="btn-ghost" onClick={logout}>Déconnexion</button>
          </div>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  )
}
