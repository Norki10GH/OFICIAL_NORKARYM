// client/src/js/pages/inici.js
import { initTypingEffect } from '../components/typing-effect.js';
import { initParticleAnimation } from '../components/particle-animation.js';

// Funció per controlar el menú responsive
function initMenuToggle() {
    const toggleButton = document.querySelector('.header-brand-group .header-logo');
    const menuDropdown = document.getElementById('main-navigation-group');

    if (toggleButton && menuDropdown) {
        const closeMenu = () => {
            menuDropdown.classList.remove('is-open');
            document.body.classList.remove('menu-open');
        };

        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el clic es propagui al menú
            const isMenuOpen = menuDropdown.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', isMenuOpen);
        });

        // Tancar el menú si es fa clic fora d'ell
        menuDropdown.addEventListener('click', (e) => {
            if (e.target === menuDropdown) {
                closeMenu();
            }
        });

        // Tancar el menú en fer clic a un enllaç
        const navLinks = menuDropdown.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(closeMenu, 300);
            });
        });
    }
}

// Funció per la lògica de canvi d'estil del header en fer scroll
function initHeaderScroll() {
    const header = document.querySelector('.main-header');
    const heroSection = document.querySelector('.hero-section');
    
    if (header && heroSection) {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };

        const handleHeroVisibility = () => {
            const heroBottom = heroSection.getBoundingClientRect().bottom;
            if (heroBottom > 0) {
                header.classList.add('on-hero');
            } else {
                header.classList.remove('on-hero');
            }
        };

        const handleAllChanges = () => {
            handleScroll();
            handleHeroVisibility();
        }

        window.addEventListener('scroll', handleAllChanges);
        handleAllChanges();
    }
}


// --- Lògica d'animacions per a la Hero Section (Base Restaurada) ---
function initHeroAnimation() {
    const heroParagraph = document.getElementById('hero-paragraph');
    const heroButton = document.getElementById('hero-button');
    const textToType = "Recupera la il·lusió pel teu projecte.";
    
    if (heroParagraph && heroButton) {
        // Cridem la nova funció reutilitzable
        initTypingEffect('hero-h1', textToType, () => {
            // Aquest codi s'executa quan l'animació acaba
            heroParagraph.classList.add('visible');
            heroButton.classList.add('visible');
        });
    }
}

// --- NOVA FUNCIÓ: Lògica per al SLIDER de la secció Manifest ---
function initManifestSlider() {
    const sliderContainer = document.querySelector('.manifest-horizontal-scroll');
    const prevButton = document.getElementById('manifest-prev-btn');
    const nextButton = document.getElementById('manifest-next-btn');
    
    if (!sliderContainer || !prevButton || !nextButton) {
        return; // No executem res si els elements no existeixen
    }

    const panels = sliderContainer.querySelectorAll('.manifest-panel');
    const totalPanels = panels.length;
    let currentIndex = 0;

    // Funció per actualitzar l'estat dels botons (activat/desactivat)
    const updateButtonStates = () => {
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === totalPanels - 1;
    };

    // Funció per anar a un panell específic
    const goToPanel = (index) => {
        const offset = -index * 100; // Cada panell és 100vw
        sliderContainer.style.transform = `translateX(${offset}vw)`;
        currentIndex = index;
        updateButtonStates();
    };

    // Esdeveniment per al botó 'següent'
    nextButton.addEventListener('click', () => {
        if (currentIndex < totalPanels - 1) {
            goToPanel(currentIndex + 1);
        }
    });

    // Esdeveniment per al botó 'anterior'
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            goToPanel(currentIndex - 1);
        }
    });

    // Inicialitzem l'estat dels botons al carregar la pàgina
    goToPanel(0); 
}


export function iniciPage() {
    initParticleAnimation();
    initHeroAnimation();
    initMenuToggle();
    initHeaderScroll();
    initManifestSlider(); // <-- CRIDA A LA NOVA FUNCIó DEL SLIDER
}