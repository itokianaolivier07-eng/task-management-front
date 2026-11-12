// Mêmes valeurs que les enums Java (TaskStatus, Priority, Role).
export const STATUSES = [
  { value: 'TODO', label: 'À faire' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'REVIEW', label: 'En revue' },
  { value: 'DONE', label: 'Terminé' },
]

export const PRIORITIES = [
  { value: 'LOW', label: 'Basse' },
  { value: 'MEDIUM', label: 'Moyenne' },
  { value: 'HIGH', label: 'Haute' },
  { value: 'URGENT', label: 'Urgente' },
]

export const ROLES = [
  { value: 'OWNER', label: 'Propriétaire' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MEMBER', label: 'Membre' },
]

// Rôles qu'on peut attribuer à un membre (OWNER = créateur du workspace).
export const ASSIGNABLE_ROLES = ROLES.filter((r) => r.value !== 'OWNER')

export const labelOf = (list, value) => list.find((i) => i.value === value)?.label ?? value
