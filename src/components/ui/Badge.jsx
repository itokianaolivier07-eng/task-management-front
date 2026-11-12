import { PRIORITIES, ROLES, STATUSES, labelOf } from '../../constants/enums.js'

export const PriorityBadge = ({ value }) => (
  <span className={`badge prio-${value}`}>{labelOf(PRIORITIES, value)}</span>
)
export const StatusBadge = ({ value }) => (
  <span className={`badge status-${value}`}>{labelOf(STATUSES, value)}</span>
)
export const RoleBadge = ({ value }) => <span className={`badge role-${value}`}>{labelOf(ROLES, value)}</span>
