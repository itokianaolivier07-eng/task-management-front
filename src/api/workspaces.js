import { request } from './client.js'

export const listWorkspaces = () => request('/workspaces')
export const getWorkspace = (id) => request(`/workspaces/${id}`)
export const createWorkspace = (data) => request('/workspaces', { method: 'POST', body: data })
export const updateWorkspace = (id, data) => request(`/workspaces/${id}`, { method: 'PUT', body: data })
export const deleteWorkspace = (id) => request(`/workspaces/${id}`, { method: 'DELETE' })

export const listMembers = (id) => request(`/workspaces/${id}/members`)
export const addMember = (id, email, role) =>
  request(`/workspaces/${id}/members`, { method: 'POST', body: { email, role } })
export const updateMemberRole = (id, memberId, role) =>
  request(`/workspaces/${id}/members/${memberId}`, { method: 'PATCH', body: { role } })
export const removeMember = (id, memberId) =>
  request(`/workspaces/${id}/members/${memberId}`, { method: 'DELETE' })
