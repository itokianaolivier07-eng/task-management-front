import { request } from './client.js'

// Optionnel : nécessite backend-patch/UserController.java. Sans lui, l'interface affiche l'e-mail.
export const getMe = () => request('/users/me')
