// OFICIAL_NORKARYM/vite.config.js (Versió Actualitzada)
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(__dirname, 'CLIENT'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        // Pàgina principal (la que ja teníem)
        main: resolve(__dirname, 'CLIENT/index.html'),

        // Afegim la nova pàgina d'inscripció.
        // L'arxiu físic ha d'estar a CLIENT/src/pages/inscripcio.html
        inscripcio: resolve(__dirname, 'CLIENT/src/pages/inscripcio.html'),
      },
    },
  },
});