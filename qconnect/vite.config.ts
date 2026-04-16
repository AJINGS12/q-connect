import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy OAuth token exchange to avoid CORS in dev
      '/qf-oauth': {
        target: 'https://prelive-oauth2.quran.foundation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qf-oauth/, ''),
        secure: true,
      },
    },
  },
})
