import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs'
  },
  // facultatif, pour désactiver temporairement l’overlay d’erreur :
  server: {
    hmr: { overlay: false }
  }
})
