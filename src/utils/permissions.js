// Reflète le tableau de permissions du README du back. Le back reste l'autorité :
// ici on ne fait que masquer les boutons inutiles. Une action interdite renverrait de toute façon un 403.
const isManager = (role) => role === 'OWNER' || role === 'ADMIN'

export const can = {
  manageWorkspace: (role) => isManager(role), // inviter, modifier le workspace
  deleteWorkspace: (role) => role === 'OWNER',
  changeRoles: (role) => role === 'OWNER',
  // Invitation : OWNER -> ADMIN ou MEMBER ; ADMIN -> MEMBER uniquement (règle du back).
  inviteAs: (myRole, role) =>
    myRole === 'OWNER' ? role !== 'OWNER' : myRole === 'ADMIN' && role === 'MEMBER',
  manageProjects: (role) => isManager(role),

  removeMember: (myRole, targetRole) =>
    myRole === 'OWNER' ? targetRole !== 'OWNER' : myRole === 'ADMIN' && targetRole === 'MEMBER',

  // MEMBER : seulement si créateur ou assigné (comparaison par e-mail, présent dans le JWT)
  editTask: (role, task, email) =>
    isManager(role) || task.createdBy?.email === email || task.assignee?.email === email,
  // MEMBER : seulement si créateur
  deleteTask: (role, task, email) => isManager(role) || task.createdBy?.email === email,
  // MEMBER : seulement ses propres commentaires
  deleteComment: (role, comment, email) => isManager(role) || comment.author?.email === email,
}
