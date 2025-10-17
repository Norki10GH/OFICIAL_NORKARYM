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


// --- Lògica d'animacions per a la Hero Section ---
function initHeroAnimation() {
    const heroTitle = document.getElementById('hero-h1');
    const heroParagraph = document.getElementById('hero-paragraph');
    const heroButton = document.getElementById('hero-button');
    const textToType = "Comencem a introduir les dades.";
    
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

// --- Lògica per al SLIDER de la secció Manifest ---
function initManifestSlider() {
    const sliderContainer = document.querySelector('.manifest-horizontal-scroll');
    const prevButton = document.getElementById('manifest-prev-btn');
    const nextButton = document.getElementById('manifest-next-btn');
    
    if (!sliderContainer || !prevButton || !nextButton) {
        return;
    }

    const panels = sliderContainer.querySelectorAll('.manifest-panel');
    const totalPanels = panels.length;
    let currentIndex = 0;

    const updateButtonStates = () => {
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === totalPanels - 1;
    };

    const goToPanel = (index) => {
        const offset = -index * 100;
        sliderContainer.style.transform = `translateX(${offset}vw)`;
        currentIndex = index;
        updateButtonStates();
    };

    nextButton.addEventListener('click', () => {
        if (currentIndex < totalPanels - 1) {
            goToPanel(currentIndex + 1);
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            goToPanel(currentIndex - 1);
        }
    });

    goToPanel(0); 
}

// --- Lògica per al formulari de registre d'administradors (versió amb contrasenya) ---
function initAdminForm() {
    const form = document.getElementById('form-nou-admin');
    const resultatDiv = document.getElementById('form-resultat');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Registrant...';

        resultatDiv.style.display = 'none';
        resultatDiv.className = 'form-resultat';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        if (data.password !== data.confirmPassword) {
            resultatDiv.textContent = 'Error: Les contrasenyes no coincideixen.';
            resultatDiv.classList.add('error');
            resultatDiv.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = 'Registrar Administrador';
            return;
        }

        if (data.password.length < 8) {
            resultatDiv.textContent = 'Error: La contrasenya ha de tenir com a mínim 8 caràcters.';
            resultatDiv.classList.add('error');
            resultatDiv.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = 'Registrar Administrador';
            return;
        }

        const dataToSend = {
            nom: data.nom,
            email: data.email,
            password: data.password,
            notes: data.notes,
        };

        try {
            const response = await fetch('/api/registrarAdmin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Hi ha hagut un error desconegut.');
            }

            resultatDiv.textContent = result.message;
            resultatDiv.classList.add('success');
            form.reset();

        } catch (error) {
            resultatDiv.textContent = error.message;
            resultatDiv.classList.add('error');
        } finally {
            resultatDiv.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = 'Registrar Administrador';
        }
    });
}


// --- VERSIÓ MILLORADA: Lògica per mostrar els registres d'auditoria ---
function initAuditLogViewer() {
    const showButton = document.getElementById('btn-show-audit');
    const auditSection = document.getElementById('audit-log-section');
    const tableBody = document.querySelector('#audit-log-table tbody');

    if (!showButton || !auditSection || !tableBody) {
        console.error("No s'han trobat els elements necessaris per a l'auditoria.");
        return;
    }

    const fetchAndRenderLogs = async () => {
        // Mostrem un missatge de càrrega
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Carregant registres...</td></tr>';

        try {
            const response = await fetch('/api/audit-logs');
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !Array.isArray(result.data)) {
                throw new Error(result.message || 'La resposta del servidor no té el format esperat.');
            }

            // Buidem la taula abans de renderitzar
            tableBody.innerHTML = '';

            if (result.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hi ha registres per mostrar.</td></tr>';
                return;
            }

            const rows = result.data.map(log => {
                // Formatem la data de manera segura
                const data = new Date(log.data_accio_nk).toLocaleString('ca-ES', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
                
                // Funció auxiliar per escapar HTML i evitar problemes de renderitzat
                const escape = (str) => str ? String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

                return `
                    <tr>
                        <td>${escape(data)}</td>
                        <td>${escape(log.id_admin_nk) || 'N/A'}</td>
                        <td>${escape(log.accio_nk)}</td>
                        <td>${escape(log.taula_objectiu_nk)}</td>
                        <td>${escape(log.id_objectiu_nk)}</td>
                        <td><pre>${escape(log.valor_antic_nk)}</pre></td>
                        <td><pre>${escape(log.valor_nou_nk)}</pre></td>
                    </tr>
                `;
            }).join('');

            tableBody.innerHTML = rows;

        } catch (error) {
            console.error("Error en carregar els registres d'auditoria:", error);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
        }
    };

    showButton.addEventListener('click', () => {
        const isHidden = auditSection.classList.toggle('is-hidden');
        showButton.textContent = isHidden ? 'Accés als Registres' : 'Amagar Registres';

        // Si la secció es mostra, carreguem les dades
        if (!isHidden) {
            fetchAndRenderLogs();
        }
    });
}


// Funció principal que s'exporta i s'executa a main.js
export function adminPage() {
    initMenuToggle();
    initHeaderScroll();
    initHeroAnimation();
    initManifestSlider();
    initAdminForm();
    initAuditLogViewer();
}