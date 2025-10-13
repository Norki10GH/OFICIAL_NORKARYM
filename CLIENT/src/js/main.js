// CLIENT/src/js/main.js // carn al punt

import { initParticleAnimation } from './components/particle-animation.js';

// Aquesta funció s'executa quan el DOM està completament carregat
document.addEventListener('DOMContentLoaded', () => {
  // Sempre inicialitzem l'animació de partícules
  initParticleAnimation();

  // Mirem quina pàgina s'ha carregat a través de la classe del body
  const page = document.body.className;

  if (page === 'page-inici') {
    // Si és la pàgina d'inici, importem i executem la seva lògica
    import('./pages/inici.js').then(module => {
      module.iniciPage();
    });
  }
  // Podríem afegir més 'else if' per a altres pàgines (login, admin, etc.)
});