import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loginRequest, registerRequest } from '../api/auth.js'
import { setUnauthorizedHandler } from '../api/client.js'
import { clearToken, decodeToken, getExpiryMs, getToken, isTokenValid, saveToken } from './tokenStorage.js'

const AuthContext = createContext(null)

// Au démarrage : on reprend le token du localStorage seulement s'il n'est pas expiré.
function readInitialToken() {
  const token = getToken()
  if (isTokenValid(token)) return token
  clearToken()
  return null
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readInitialToken)

  const logout = useCallback(() => {
    clearToken()
    setToken(null)
  }, [])

  const startSession = useCallback((newToken) => {
    saveToken(newToken)
    setToken(newToken)
  }, [])

  const login = useCallback(
    async (email, password) => startSession((await loginRequest(email, password)).token),
    [startSession],
  )

  const register = useCallback(
    async (name, email, password) => startSession((await registerRequest(name, email, password)).token),
    [startSession],
  )

  // Un 401 reçu par n'importe quel appel API déconnecte l'utilisateur.
  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  // Déconnexion automatique au moment exact où le token expire.
  useEffect(() => {
    if (!token) return
    const delay = getExpiryMs(token) - Date.now()
    // setTimeout est limité à ~24,8 jours : au-delà, on laisse le 401 du back déconnecter.
    if (delay > 2_147_483_647) return
    const timer = setTimeout(logout, Math.max(delay, 0))
    return () => clearTimeout(timer)
  }, [token, logout])

  // Synchronisation entre onglets : se déconnecter dans l'un déconnecte les autres.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'taskflow_token' && !e.newValue) setToken(null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => {
    const data = token ? decodeToken(token) : null
    return {
      isAuthenticated: Boolean(token),
      user: data ? { email: data.sub } : null,
      login,
      register,
      logout,
    }
  }, [token, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
