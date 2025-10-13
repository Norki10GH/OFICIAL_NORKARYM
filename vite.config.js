// OFICIAL_NORKARYM/vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(__dirname, 'CLIENT'),

  // --> AFEGEIX AQUESTA NOVA SECCIÓ <--
  server: {
    proxy: {
      // Qualsevol petició que comenci per '/api'
      '/api': {
        // La redirigim a l'emulador de Functions
        target: 'http://127.0.0.1:5001/norkarym/europe-west1',
        // Important per a que funcioni correctament
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'CLIENT/index.html'),
        // Afegeix aquí altres pàgines si les tens
      },
    },
  },
});