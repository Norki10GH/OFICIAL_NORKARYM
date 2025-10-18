// client/src/js/main.js

// Importar CSS globales y de páginas para que Vite los incluya en el build
import '../css/base/reset.css';
import '../css/base/base.css';
import '../css/components/forms.css';
import '../css/pages/admin-layout.css';
import '../css/pages/admin.css';
import '../css/pages/inici.css';

import { getApp } from 'firebase/app';
import { initParticleAnimation } from './components/particle-animation.js';

// Función para inicializar Firebase
async function initFirebase() {
  try {
    await import('../config/firebase-init.js');
    const app = getApp();
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
}

// Función para inicializar la página de admin
async function initAdminPage() {
  try {
    const module = await import('./pages/admin.js');
    await module.adminPage();
    console.log('Admin page initialized successfully');
  } catch (error) {
    console.error('Error initializing admin page:', error);
  }
}

// Función para inicializar la página de inscripción
async function initInscripcioPage() {
  try {
    const module = await import('./pages/inscripcio.js');
    await module.inscripcioPage();
    console.log('Inscripcio page initialized successfully');
  } catch (error) {
    console.error('Error initializing inscripcio page:', error);
  }
}

// Esperar a que el DOM esté completamente cargado
async function init() {
  // Desregistrar service workers antiguos que puedan pedir assets cacheados
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs && regs.length) {
        console.log('Found service workers, unregistering to avoid stale cached assets');
        await Promise.all(regs.map(r => r.unregister()));
        console.log('Service workers unregistered');
      }
    } catch (err) {
      console.warn('Error unregistering service workers:', err);
    }
  }

  await initFirebase();
    
  try {
    initParticleAnimation();
    const page = document.body.className;

    if (page === 'page-admin') {
      await initAdminPage();
      } else if (page === 'page-admin-login') {
        try {
          const mod = await import('./pages/admin-login.js');
          await mod.adminLoginPage();
          console.log('Admin login page initialized successfully');
        } catch (err) {
          console.error('Error initializing admin login page:', err);
        }
      } else if (page.includes('page-inscripcio')) {
      await initInscripcioPage();
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Asegurarnos de que el DOM esté cargado antes de inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}