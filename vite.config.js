// OFICIAL_NORKARYM/vite.config.js (Versió Definitiva i Correcta)
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // 1. Definim on es troba el codi font del nostre frontend.
  root: resolve(__dirname, 'CLIENT'),

  // 2. Configurem el procés de 'build' per a producció.
  build: {
    // La carpeta on es generarà la versió final es dirà 'dist' i estarà a l'arrel del projecte.
    outDir: resolve(__dirname, 'dist'),
    
    // --> AFEGEIX AQUESTA LÍNIA <--
    // Permet a Vite netejar la carpeta 'dist' encara que estigui fora del 'root'.
    emptyOutDir: true, 

    rollupOptions: {
      // Definim explícitament cada pàgina HTML de la nostra aplicació.
      input: {
        main: resolve(__dirname, 'CLIENT/index.html'),
        // Quan creeu més pàgines, les afegireu aquí. Per exemple:
        // login: resolve(__dirname, 'CLIENT/src/pages/login.html'),
      },
    },
  },
});