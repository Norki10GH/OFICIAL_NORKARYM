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
    // Aquesta línia ara funcionarà perquè l'arxiu existeix
    import('./pages/inscripcio.js').then(module => {
      module.inscripcioPage();
    });
  } else if (page === 'page-admin') {
    import('./pages/administradors.js').then(module => {
      module.administradorsPage();
    });
  }
});