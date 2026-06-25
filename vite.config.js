import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Base relativa: funciona en la raíz y también bajo un subpath
  // (p. ej. usuario.github.io/ToDo/) sin tener que fijar el nombre del repo.
  base: './',
  server: {
    host: true,
    port: 5173,
  },
})
