import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// En dev, toutes les requêtes /api/... sont relayées vers Spring Boot.
// Le navigateur croit parler à un seul serveur (localhost:5173) => pas de CORS à configurer.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: { '/api': env.VITE_API_PROXY_TARGET || 'http://localhost:8080' },
    },
  }
})
