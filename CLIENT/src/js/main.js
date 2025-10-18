// CLIENT/src/js/main.js

import { adminPage } from './pages/admin.js';
import { iniciPage } from './pages/inici.js';

document.addEventListener('DOMContentLoaded', () => {
    // Comprova en quina pàgina ens trobem per inicialitzar el codi específic
    if (document.body.classList.contains('page-admin')) {
        adminPage();
    }
    
    if (document.body.classList.contains('page-inici')) {
        iniciPage();
    }
});
