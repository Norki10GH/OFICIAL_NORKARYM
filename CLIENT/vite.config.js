// CLIENT/vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // L'arrel del projecte és la carpeta CLIENT
  root: './', 
  build: {
    // La carpeta de sortida per al codi de producció serà 'dist'
    outDir: 'dist',
    rollupOptions: {
      // Li diem a Vite quins són tots els teus fitxers HTML
      input: {
        main: resolve(__dirname, 'index.html'), // Necessites un index.html a CLIENT
        login: resolve(__dirname, 'IND_HTML/Login.html'),
        dashboard: resolve(__dirname, 'IND_HTML/Dashboard.html'),
        admin: resolve(__dirname, 'IND_HTML/Admin.html'),
        // Afegeix aquí la resta de les teves pàgines HTML
      }
    }
  }
});