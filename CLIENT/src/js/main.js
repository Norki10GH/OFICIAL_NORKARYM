// Contenido para el archivo: CLIENT/src/js/main.js

// 👇 ¡MODIFICA ESTA LÍNEA!
// Esto importa y ejecuta el código de inicialización de Firebase por su efecto secundario.
import '../config/firebase-init.js';

import { initParticleAnimation } from './components/particle-animation.js';

document.addEventListener('DOMContentLoaded', () => {
  // Ahora la app ya está conectada a Firebase antes de que nada más ocurra.
  initParticleAnimation();

  const page = document.body.className;

  if (page === 'page-inici') {
    import('./pages/inici.js').then(module => {
      module.initHomePage();
    }).catch(err => {
      console.error('Error loading homepage module:', err);
    });
  } else if (page === 'page-inscripcio') {
    import('./pages/inscripcio.js').then(module => {
      module.inscripcioPage();
    });
  } else if (page === 'page-admin') {
    import('./pages/administradors.js').then(module => {
      module.administradorsPage();
    });
  }
});