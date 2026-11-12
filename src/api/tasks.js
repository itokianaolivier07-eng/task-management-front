import { request } from './client.js'
import { toQuery } from './query.js'

// filters : { status, priority, assigneeId }
export const listTasks = (projectId, filters) => request(`/projects/${projectId}/tasks${toQuery(filters)}`)
export const myTasks = () => request('/tasks/mine')
export const getTask = (id) => request(`/tasks/${id}`)
export const createTask = (projectId, data) =>
  request(`/projects/${projectId}/tasks`, { method: 'POST', body: data })
export const updateTask = (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: data })
export const updateTaskStatus = (id, status) =>
  request(`/tasks/${id}/status`, { method: 'PATCH', body: { status } })
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' })
