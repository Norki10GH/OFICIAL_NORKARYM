// client/src/js/main.js

import '/src/config/firebase-init.js';
import { initParticleAnimation } from './components/particle-animation.js';

document.addEventListener('DOMContentLoaded', () => {
  initParticleAnimation();

  const page = document.body.className;

  if (page === 'page-inici') {
    import('./pages/inici.js').then(module => {
      module.iniciPage();
    });
  } else if (page === 'page-admin') { // <-- NOU BLOC
    import('./pages/admin.js').then(module => {
      module.adminPage();
    });
  } else if (page.includes('page-inscripcio')) {
    import('./pages/inscripcio.js').then(module => {
      module.inscripcioPage();
    });
  }
});