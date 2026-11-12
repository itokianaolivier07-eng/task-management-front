import { request } from './client.js'

export const listComments = (taskId) => request(`/tasks/${taskId}/comments`)
export const addComment = (taskId, content) =>
  request(`/tasks/${taskId}/comments`, { method: 'POST', body: { content } })
export const deleteComment = (id) => request(`/comments/${id}`, { method: 'DELETE' })
