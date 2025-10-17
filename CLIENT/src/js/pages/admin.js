// client/src/js/pages/admin.js (Lògica de la pàgina d'administració)

// Funció per controlar el menú responsive (ara activat pel Logotip)
function initMenuToggle() {
    const toggleButton = document.getElementById('menu-toggle');
    const menuDropdown = document.getElementById('main-navigation-group');
    const navLinks = menuDropdown ? menuDropdown.querySelectorAll('a[href^="#"]') : [];

    if (toggleButton && menuDropdown) {
        
        const closeMenu = () => {
            menuDropdown.classList.remove('is-open');
            document.body.classList.remove('menu-open');
        };

        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            const isMenuOpen = menuDropdown.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', isMenuOpen);

            if (isMenuOpen) {
                menuDropdown.addEventListener('click', (e) => {
                    if (e.target === menuDropdown) {
                        closeMenu();
                    }
                }, { once: true });
            }
        });

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
    const heroTitle = document.getElementById('hero-h1');
    const heroParagraph = document.getElementById('hero-paragraph');
    const heroButton = document.getElementById('hero-button');
    const textToType = "Recupera la il·lusió pel teu projecte.";
    
    if (heroTitle && heroParagraph && heroButton) {
        let i = 0;
        
        function typeWriter() {
            if (i < textToType.length) {
                heroTitle.innerHTML += textToType.charAt(i);
                i++;
                setTimeout(typeWriter, 75);
            } else {
                heroParagraph.classList.add('visible');
                heroButton.classList.add('visible');
            }
        }

        heroTitle.innerHTML = '';
        typeWriter();
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


export function adminPage() {
    initHeroAnimation();
    initMenuToggle();
    initHeaderScroll();
    initManifestSlider(); // <-- CRIDA A LA NOVA FUNCIÓ DEL SLIDER
}
// CLIENT/src/js/pages/admin.js

function initAdminForm() {
    const form = document.getElementById('form-nou-admin');
    const resultatDiv = document.getElementById('form-resultat');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitem que la pàgina es recarregui

        // Desactivem el botó per evitar enviaments múltiples
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Registrant...';

        // Amaguem missatges previs
        resultatDiv.style.display = 'none';
        resultatDiv.className = 'form-resultat';

        // Recollim les dades del formulari
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Enviem les dades a la nostra Cloud Function
            const response = await fetch('/api/registrarAdmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                // Si la resposta no és 2xx, llancem un error amb el missatge del servidor
                throw new Error(result.message || 'Hi ha hagut un error desconegut.');
            }

            // Èxit! Mostrem el missatge de confirmació
            resultatDiv.textContent = result.message;
            resultatDiv.classList.add('success');
            form.reset(); // Netegem el formulari

        } catch (error) {
            // Error! Mostrem el missatge d'error
            resultatDiv.textContent = error.message;
            resultatDiv.classList.add('error');
        } finally {
            // Tornem a activar el botó
            resultatDiv.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = 'Registrar Administrador';
        }
    });
}

// Exportem la funció principal d'aquesta pàgina
export function adminPage() {
    initAdminForm();
}