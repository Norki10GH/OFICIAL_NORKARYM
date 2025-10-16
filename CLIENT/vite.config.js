import { defineConfig } from 'vite';

export default defineConfig({
  // NO es necesaria la opción 'root'. Vite usará esta carpeta ('CLIENT') como raíz.

  build: {
    // Sube un nivel ('../') para crear la carpeta 'dist' en la raíz del proyecto,
    // fuera de 'CLIENT'.
    outDir: '../dist',
    
    // Opcional pero recomendado: Vacía la carpeta 'dist' antes de cada build.
    emptyOutDir: true 
  }
});