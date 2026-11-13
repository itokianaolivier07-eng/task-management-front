import { request } from './client.js'

// Profil de l'utilisateur connecté ({ id, name, email }) : sert à afficher le nom dans la barre du haut.
export const getMe = () => request('/users/me')
