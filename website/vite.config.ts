import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Omar102598/' : '/',
  server: {
    cors: true,
    allowedHosts: true,
  },
}))
