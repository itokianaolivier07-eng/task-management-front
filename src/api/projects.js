import { request } from './client.js'

export const listProjects = (workspaceId) => request(`/workspaces/${workspaceId}/projects`)
export const getProject = (id) => request(`/projects/${id}`)
export const createProject = (workspaceId, data) =>
  request(`/workspaces/${workspaceId}/projects`, { method: 'POST', body: data })
export const updateProject = (id, data) => request(`/projects/${id}`, { method: 'PUT', body: data })
export const deleteProject = (id) => request(`/projects/${id}`, { method: 'DELETE' })
