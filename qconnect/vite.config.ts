import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      // Proxy OAuth token exchange to avoid CORS in dev
      '/qf-oauth': {
        target: 'https://oauth2.quran.foundation',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qf-oauth/, ''),
        secure: true,
      },
    },
  },
})
