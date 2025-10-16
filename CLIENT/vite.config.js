import { defineConfig } from 'vite';

export default defineConfig({
  // Le dice a Vite que la raíz de tu proyecto web es la carpeta 'CLIENT'.
  root: 'CLIENT',

  build: {
    // Le dice a Vite que la carpeta de salida para la compilación se llame 'dist'
    // y la cree en la raíz del proyecto (no dentro de 'CLIENT').
    outDir: 'dist'
  }
});