import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Arrel del projecte frontend
  root: 'client',

  // Configuració del build
  build: {
    // Directori de sortida relatiu a l'arrel del repositori
    outDir: '../dist',
    // Neteja el directori de sortida abans de construir
    emptyOutDir: true,
    // 👇 AFEGEIX AIXÒ 👇
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'client/index.html'),
        admin: resolve(__dirname, 'client/src/pages/admin.html'),
        inscripcio: resolve(__dirname, 'client/src/pages/inscripcio.html'),
      },
    },
  },

  // Configuració del servidor de desenvolupament
  server: {
    // Proxy per a les crides a l'API durant el desenvolupament
    proxy: {
      '/api': 'http://127.0.0.1:5001',
    },
  },
});