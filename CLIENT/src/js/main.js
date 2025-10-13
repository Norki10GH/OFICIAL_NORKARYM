// CLIENT/src/js/main.js

import { initParticleAnimation } from './components/particle-animation.js';

document.addEventListener('DOMContentLoaded', () => {
  initParticleAnimation();

  const page = document.body.className;

  if (page === 'page-inici') {
    import('./pages/inici.js').then(module => {
      module.iniciPage();
    });
  } else if (page === 'page-inscripcio') {
    import('./pages/inscripcio.js').then(module => {
      module.inscripcioPage();
    });
  } else if (page === 'page-admin') {
    // NOU: Càrrega de la lògica per a la pàgina d'administradors
    import('./pages/administradors.js').then(module => {
      module.administradorsPage();
    });
  }
});