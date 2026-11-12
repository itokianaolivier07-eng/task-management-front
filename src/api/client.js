import { getToken } from '../auth/tokenStorage.js'

const BASE_URL = '/api'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Le contexte d'authentification enregistre ici sa fonction "logout".
// Ainsi, n'importe quel appel qui reçoit un 401 peut déconnecter l'utilisateur.
let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn
}

/**
 * request('/workspaces')                                      -> GET avec token
 * request('/auth/login', { method:'POST', body, auth:false }) -> sans token
 */
export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Serveur injoignable. Vérifie que l’API tourne.')
  }

  // 401 sur une route protégée = token absent, invalide ou expiré -> on déconnecte.
  // (Sur /auth/login, un 401 veut dire "mauvais mot de passe" : auth=false, donc on ne déconnecte pas.)
  if (response.status === 401 && auth) {
    onUnauthorized()
    throw new ApiError(401, 'Session expirée, reconnecte-toi.')
  }

  if (!response.ok) {
    let message = 'Une erreur est survenue'
    try {
      // Le back renvoie toujours { timestamp, status, message }
      message = (await response.json()).message ?? message
    } catch {
      /* corps vide ou non JSON : on garde le message par défaut */
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return null // DELETE : pas de contenu
  return response.json()
}
