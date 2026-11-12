// Tout ce qui touche au token JWT est ici : stockage, lecture du contenu, expiration.
const KEY = 'taskflow_token'

export const getToken = () => localStorage.getItem(KEY)
export const saveToken = (token) => localStorage.setItem(KEY, token)
export const clearToken = () => localStorage.removeItem(KEY)

// Un JWT = 3 parties séparées par des points. La 2e (le "payload") est du JSON encodé en Base64URL.
// ATTENTION : on LIT le contenu, on ne le VÉRIFIE pas (seul le serveur connaît la clé secrète).
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    return JSON.parse(json) // { sub: email, iat, exp }
  } catch {
    return null
  }
}

// exp est en SECONDES, Date.now() en millisecondes.
export function getExpiryMs(token) {
  const data = decodeToken(token)
  return data?.exp ? data.exp * 1000 : null
}

export function isTokenValid(token) {
  if (!token) return false
  const exp = getExpiryMs(token)
  return exp !== null && exp > Date.now()
}
