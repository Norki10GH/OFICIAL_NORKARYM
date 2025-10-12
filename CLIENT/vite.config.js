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

        // Pàgines reals dins de la subcarpeta IND_HTML
        afClients: resolve(__dirname, 'IND_HTML/AF_CLIENTS.html'),
        afGallina: resolve(__dirname, 'IND_HTML/AF_GALLINA.html'),
        admin: resolve(__dirname, 'IND_HTML/Admin.html'),
        adminLogin: resolve(__dirname, 'IND_HTML/AdminLogin.html'),
        gestioEmpresaMare: resolve(__dirname, 'IND_HTML/GestioEmpresaMare.html'),
        gestioMarques: resolve(__dirname, 'IND_HTML/GestioMarques.html'),
        login: resolve(__dirname, 'IND_HTML/Login.html'),
        newuser: resolve(__dirname, 'IND_HTML/Newuser.html'),
        pagIndef: resolve(__dirname, 'IND_HTML/PAG_INDEF.html')
      }
    }
  }
});