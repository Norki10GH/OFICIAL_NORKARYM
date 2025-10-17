// CLIENT/src/js/main.js

import { adminPage } from './pages/admin.js';

document.addEventListener('DOMContentLoaded', () => {
    // Comprova en quina pàgina ens trobem per inicialitzar el codi específic
    if (document.body.classList.contains('page-admin')) {
        adminPage();
    }
    // Afegeix aquí altres comprovacions per a diferents pàgines si és necessari
    // if (document.body.classList.contains('page-inici')) {
    //     iniciPage();
    // }
});
