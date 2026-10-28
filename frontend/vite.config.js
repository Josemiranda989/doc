import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// El front no le pega directo al back (CORS): Vite redirige /api al backend.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
