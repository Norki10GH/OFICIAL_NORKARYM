// Contenido para el archivo: CLIENT/src/js/main.js

// 👇 ¡AÑADE ESTA LÍNEA AL PRINCIPIO DE TODO!
// Esto importa y ejecuta el código de inicialización de Firebase.
import { auth } from '../config/firebase-init.js';

import { initParticleAnimation } from './components/particle-animation.js';

document.addEventListener('DOMContentLoaded', () => {
  // Ahora la app ya está conectada a Firebase antes de que nada más ocurra.
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
    import('./pages/administradors.js').then(module => {
      module.administradorsPage();
    });
  }
});