// dueDate arrive sous la forme "2026-12-01". On évite new Date("2026-12-01") (interprété en UTC,
// ce qui peut décaler d'un jour) : on construit la date en heure locale.
function parseLocalDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDate(iso) {
  if (!iso) return ''
  return parseLocalDate(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

export function isOverdue(task) {
  if (!task.dueDate || task.status === 'DONE') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parseLocalDate(task.dueDate) < today
}

// "" -> null pour les champs optionnels envoyés au back
export const emptyToNull = (v) => (v && v.trim() !== '' ? v.trim() : null)
