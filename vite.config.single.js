import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build de un único archivo HTML autocontenido (JS, CSS y fuentes embebidas).
// Se puede abrir con doble clic vía file:// sin servidor ni conexión.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    outDir: 'dist-single',
    assetsInlineLimit: 100000000, // inlinear todo (incluidas las fuentes) como base64
    chunkSizeWarningLimit: 5000,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
