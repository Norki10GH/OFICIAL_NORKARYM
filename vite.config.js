// OFICIAL_NORKARYM/vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(__dirname, 'CLIENT'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'CLIENT/index.html'),
        // Afegeix la pàgina d'inscripció aquí
        inscripcio: resolve(__dirname, 'CLIENT/src/pages/inscripcio.html'),
      },
    },
  },
  // La secció 'server' que tenies abans és opcional per ara,
  // però la necessitarem quan connectem amb el backend.
});