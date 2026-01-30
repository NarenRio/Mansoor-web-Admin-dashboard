import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 5173 is already used on the server; keep this app on a different port.
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  // If you run `npm run preview`, keep it on the same port too.
  preview: {
    port: 5174,
    strictPort: true
  }
})

