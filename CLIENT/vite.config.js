// CLIENT/vite.config.js (Versió Definitiva i Correcta)
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { glob } from 'glob';

// Genera automàticament les entrades per a Rollup a partir dels fitxers HTML
const rollupInputs = {};
const htmlFiles = glob.sync('*.html').concat(glob.sync('src/pages/**/*.html'));
htmlFiles.forEach(file => {
    // Normalitza el nom per a l'entrada de Rollup
    const name = file.includes('src/pages/') 
                 ? file.replace('src/pages/', '').replace('.html', '') 
                 : file.replace('.html', '');
    rollupInputs[name] = resolve(__dirname, file);
});

export default defineConfig({
  root: './',
  base: '/', 
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: rollupInputs,
    },
  },
  server: {
    // Aquesta configuració permet a Vite servir fitxers des de 'src'
    // tot i que l'arrel és la carpeta 'CLIENT'.
    fs: {
      strict: false,
    },
  },
});