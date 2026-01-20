import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true
  },
  // Load .env from parent directory (WhatsApp root folder)
  envDir: '..',
  define: {
    global: 'window'
  }
})
