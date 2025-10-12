// CLIENT/vite.config.js (Versió Corregida i Completa)
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: './', 
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // Pàgina principal (que és el teu Login)
        main: resolve(__dirname, 'index.html'),

        // La resta de pàgines de la teva aplicació
        dashboard: resolve(__dirname, 'IND_HTML/Dashboard.html'),
        admin: resolve(__dirname, 'IND_HTML/Admin.html'),
        adminLogin: resolve(__dirname, 'IND_HTML/AdminLogin.html'),
        afClients: resolve(__dirname, 'IND_HTML/AF_CLIENTS.html'),
        afGallina: resolve(__dirname, 'IND_HTML/AF_GALLINA.html'),
        gestioEmpresaMare: resolve(__dirname, 'IND_HTML/GestioEmpresaMare.html'),
        newuser: resolve(__dirname, 'IND_HTML/Newuser.html'),
        pagIndef: resolve(__dirname, 'IND_HTML/PAG_INDEF.html'),
        loginnou: resolve(__dirname, 'IND_HTML/loginnou.html') // Afegeixo aquesta també per si de cas
      }
    }
  }
});