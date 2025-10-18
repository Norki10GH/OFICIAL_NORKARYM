// client/src/js/main.js

import '/src/config/firebase-init.js';

// Verificar que Firebase está inicializado
import { getApp } from 'firebase/app';
try {
    const app = getApp();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

import { initParticleAnimation } from './components/particle-animation.js';

document.addEventListener('DOMContentLoaded', () => {
  initParticleAnimation();
  const page = document.body.className;

  if (page === 'page-admin') {
    import('./pages/admin.js')
      .then(module => {
        module.adminPage();
      })
      .catch(error => {
        console.error('Error loading admin module:', error);
      });
  } else if (page.includes('page-inscripcio')) {
    import('./pages/inscripcio.js').then(module => {
      module.inscripcioPage();
    });
  }
});