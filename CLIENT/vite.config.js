// CLIENT/vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: './', 
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // Correcte, aquesta és ara la pàgina de login
        // login: resolve(__dirname, 'IND_HTML/Login.html'), // Aquesta línia ja no cal, la pots eliminar
        dashboard: resolve(__dirname, 'IND_HTML/Dashboard.html'),
        admin: resolve(__dirname, 'IND_HTML/Admin.html'),
        // La resta de pàgines...
      }
    }
  }
});