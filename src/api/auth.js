import { request } from './client.js'

export const loginRequest = (email, password) =>
  request('/auth/login', { method: 'POST', body: { email, password }, auth: false })

export const registerRequest = (name, email, password) =>
  request('/auth/register', { method: 'POST', body: { name, email, password }, auth: false })
