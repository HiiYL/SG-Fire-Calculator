import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // For GitHub Pages: set base to repo name (case-sensitive!)
  // For custom domain or root deployment, use '/'
  base: process.env.GITHUB_PAGES ? '/SG-Fire-Calculator/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
