import { defineConfig } from 'vite';

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
  },

  // Configuració del servidor de desenvolupament
  server: {
    // Proxy per a les crides a l'API durant el desenvolupament
    proxy: {
      '/api': 'http://127.0.0.1:5001',
    },
  },
});