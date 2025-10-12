// CLIENT/vite.config.js (Versió Definitiva i Correcta)
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './', // Assegura rutes relatives a la compilació
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // Pàgina principal a l'arrel de CLIENT
        main: resolve(__dirname, 'index.html'),
        // Pàgines reals dins de la subcarpeta 
      }
    }
  }
});