import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // `@/` matches the alias shadcn components are generated against, so a
    // component copied from the app repo resolves without edits
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
})
