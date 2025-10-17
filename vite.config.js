import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'CLIENT',
  // Configuració del servidor de desenvolupament
  server: {
    // Proxy per redirigir les crides a /api cap a l'emulador de Firebase
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    },
  },

  // Configuració de la compilació per a producció
  build: {
    // El directori de sortida serà 'dist' a la carpeta arrel del projecte
    outDir: '../dist',
    emptyOutDir: true,
    
    // Assegura que totes les teves pàgines HTML es compilin correctament
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'CLIENT/index.html'),
        admin: resolve(__dirname, 'CLIENT/admin.html'),
        inscripcio: resolve(__dirname, 'CLIENT/inscripcio.html'),
      },
    },
  },
});
