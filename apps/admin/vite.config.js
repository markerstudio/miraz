import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served by the API server under /admin — base must match.
export default defineConfig({
  plugins: [react()],
  base: '/admin/',
})
