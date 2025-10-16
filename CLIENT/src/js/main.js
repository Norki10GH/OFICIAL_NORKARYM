// CLIENT/src/js/main.js

// L'animació de partícules ja no la fem servir a la pàgina d'inici,
// però mantenim la importació per si altres pàgines la necessiten.
import { initParticleAnimation } from './components/particle-animation.js';

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.className;

  if (page === 'page-inici') {
    // Importem i executem la lògica específica de la pàgina d'inici
    import('./pages/inici.js').then(module => {
      module.iniciPage();
    });
  } else if (page === 'page-inscripcio') {
    import('./pages/inscripcio.js').then(module => {
      module.inscripcioPage();
    });
  } else if (page === 'page-admin') {
    import('./pages/administradors.js').then(module => {
      module.administradorsPage();
    });
  } else {
    // Per a qualsevol altra pàgina, podríem inicialitzar les partícules si existeix el canvas
    initParticleAnimation();
  }
});
