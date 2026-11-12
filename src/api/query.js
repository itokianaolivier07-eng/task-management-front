// Construit "?a=1&b=2" en ignorant les valeurs vides (le back traite l'absence de filtre = tout).
export function toQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, value)
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}
