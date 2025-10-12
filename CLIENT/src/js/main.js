// CLIENT/src/js/main.js
import { initParticleAnimation } from './components/particle-animation.js';

document.addEventListener('DOMContentLoaded', () => {
    initParticleAnimation();

    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.location.href = '/inscripcio.html';
        });
    }
});
