/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    exclude: ['e2e/**', 'node_modules/**'],
  },
  server: {
    watch: {
      usePolling: true, // Forces Vite to check for changes manually
    },
  },
})