// OFICIAL_NORKARYM/vite.config.js (Versió Final)
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(__dirname, 'CLIENT'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'CLIENT/index.html'),
        inscripcio: resolve(__dirname, 'CLIENT/src/pages/inscripcio.html'),
        // NOU: Afegim la pàgina d'administradors
        administradors: resolve(__dirname, 'CLIENT/src/pages/administradors.html'),
      },
    },
  },
});