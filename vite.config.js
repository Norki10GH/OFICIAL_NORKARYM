// OFICIAL_NORKARYM/vite.config.js (Versió Final amb Proxy)
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(__dirname, 'CLIENT'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'CLIENT/index.html'),
        inscripcio: resolve(__dirname, 'CLIENT/src/pages/inscripcio.html'),
        administradors: resolve(__dirname, 'CLIENT/src/pages/administradors.html'),
      },
    },
  },
  // NOU: S'ha afegit la configuració del servidor de desenvolupament
  server: {
    // Aquesta és la clau per a la comunicació local frontend-backend
    proxy: {
      // Qualsevol petició que comenci amb '/api' serà redirigida
      '/api': {
        // Apuntem a l'emulador de functions (el port per defecte és el 5001)
        // El target complet inclou el teu project-id i la regió.
        target: 'http://127.0.0.1:5001/norkarym/europe-west1',
        // Canvia l'origen de la petició per evitar problemes de CORS
        changeOrigin: true,
        // Reescrivim la ruta per eliminar '/api' abans d'enviar-la a la funció.
        // Per exemple: /api/addAdmin -> /addAdmin (la funció es diu 'addAdmin')
        // **ACTUALITZACIÓ**: Com que la teva funció es diu `apiAddAdmin` i la crida és
        // `/api/addAdmin`, necessitem canviar el nom de la funció o la crida.
        // Mantindrem la coherència i assumirem que la funció s'ha de cridar com 'addAdmin'.
        // Si prefereixes mantenir `apiAddAdmin`, la crida des del front hauria de ser `/api/apiAddAdmin`.
        // Per ara, farem la reescriptura més estàndard.
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
});