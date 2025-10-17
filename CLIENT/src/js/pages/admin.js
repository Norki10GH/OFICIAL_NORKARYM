// client/src/js/pages/admin.js
import { initTypingEffect } from "../components/typing-effect.js";

function initAdminHeroAnimation() {
    const heroTitle = document.getElementById('hero-h1');
    const heroParagraph = document.getElementById('hero-paragraph');
    const textToType = "Panell de Control";

    if (heroTitle && heroParagraph) {
        initTypingEffect('hero-h1', textToType, () => {
            heroParagraph.classList.add('visible');
        });
    }
}

/**
 * Mostra un missatge de resultat en un formulari específic.
 * @param {string} formId - L'ID del formulari on mostrar el missatge.
 * @param {string} message - El missatge a mostrar.
 * @param {boolean} isSuccess - Si el missatge és d'èxit o d'error.
 */
function mostrarResultat(formId, message, isSuccess) {
    const resultatDiv = document.querySelector(`#${formId} + .form-resultat`);
    if (resultatDiv) {
        resultatDiv.textContent = message;
        resultatDiv.className = 'form-resultat'; // Reseteja classes
        resultatDiv.classList.add(isSuccess ? 'success' : 'error');
        resultatDiv.style.display = 'block';
    }
}

/**
 * Carrega la llista d'administradors en tots els selectors designats.
 */
async function carregarSelectorsAdmin() {
    const selectors = document.querySelectorAll('select[name="firebase_uid_admin_nk"]');
    if (selectors.length === 0) return;

    try {
        const response = await fetch('/api/administradors');
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'No s\'ha pogut carregar la llista d\'administradors.');
        }

        selectors.forEach(select => {
            select.innerHTML = '<option value="">-- Selecciona un administrador --</option>'; // Opció per defecte
            result.data.forEach(admin => {
                const option = document.createElement('option');
                option.value = admin.firebase_uid_admin_nk;
                option.textContent = `${admin.nom_admin_nk} (${admin.email_admin_nk})`;
                select.appendChild(option);
            });
        });

    } catch (error) {
        console.error("Error en carregar administradors:", error);
        selectors.forEach(select => {
            select.innerHTML = `<option value="">${error.message}</option>`;
            select.disabled = true;
        });
    }
}

/**
 * Inicialitza la lògica per al formulari d'assignació d'emails.
 */
function initAssignarEmailForm() {
    const form = document.getElementById('form-assignar-email');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const formId = form.id;

        mostrarResultat(formId, 'Processant...', true);

        try {
            const response = await fetch('/api/assignarEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error desconegut del servidor.');
            }

            mostrarResultat(formId, result.message, true);
            form.reset();
            // Opcional: Recarregar registres d'auditoria per veure el canvi
            if (document.getElementById('audit-log-table')) {
                carregarRegistresAuditoria();
            }

        } catch (error) {
            console.error(`Error en assignar l'email:`, error);
            mostrarResultat(formId, `Error: ${error.message}`, false);
        }
    });
}

/**
 * Inicialitza la lògica per al formulari de registre de productes.
 */
function initRegistrarProducteForm() {
    const form = document.getElementById('form-registrar-producte');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const formId = form.id;

        mostrarResultat(formId, 'Processant...', true);

        try {
            const response = await fetch('/api/registrarProducte', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error desconegut del servidor.');
            }

            mostrarResultat(formId, result.message, true);
            form.reset();
            // Opcional: Recarregar registres d'auditoria per veure el canvi
            if (document.getElementById('audit-log-table')) {
                carregarRegistresAuditoria();
            }
        } catch (error) {
            console.error(`Error en registrar el producte:`, error);
            mostrarResultat(formId, `Error: ${error.message}`, false);
        }
    });
}

/**
 * Inicialitza la lògica per al formulari d'assignació de productes a usuaris.
 */
function initAssignarProducteForm() {
    const form = document.getElementById('form-assignar-producte');
    const projecteSelect = document.getElementById('projecte-select-assignar');
    const versioSelect = document.getElementById('versio-select-assignar');

    if (!form || !projecteSelect || !versioSelect) return;

    // 1. Carregar els productes al selector inicial
    async function carregarProductes() {
        try {
            const response = await fetch('/api/productes');
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);

            projecteSelect.innerHTML = '<option value="">-- Selecciona un producte --</option>';
            result.data.forEach(proj => {
                const option = document.createElement('option');
                option.value = proj.id_proj_nk;
                option.textContent = proj.nom_producte_proj_nk;
                projecteSelect.appendChild(option);
            });
        } catch (error) {
            projecteSelect.innerHTML = `<option value="">Error: ${error.message}</option>`;
            projecteSelect.disabled = true;
        }
    }

    // 2. Carregar versions quan es selecciona un producte
    projecteSelect.addEventListener('change', async () => {
        const id_proj_nk = projecteSelect.value;
        versioSelect.innerHTML = '<option value="">Carregant versions...</option>';
        versioSelect.disabled = true;

        if (!id_proj_nk) {
            versioSelect.innerHTML = '<option value="">Selecciona primer un producte</option>';
            return;
        }

        try {
            const response = await fetch(`/api/productes/${id_proj_nk}/versions`);
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);

            versioSelect.innerHTML = '<option value="">-- Selecciona una versió --</option>';
            if (result.data.length === 0) {
                versioSelect.innerHTML = '<option value="">Aquest producte no té versions</option>';
                return;
            }

            result.data.forEach(versio => {
                const option = document.createElement('option');
                option.value = versio.id_versio_nk;
                option.textContent = versio.nom_versio_nk;
                versioSelect.appendChild(option);
            });
            versioSelect.disabled = false;
        } catch (error) {
            versioSelect.innerHTML = `<option value="">Error: ${error.message}</option>`;
        }
    });

    // 3. Gestionar l'enviament del formulari
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const formId = form.id;

        mostrarResultat(formId, 'Processant...', true);

        try {
            const response = await fetch('/api/assignarProducte', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);

            mostrarResultat(formId, result.message, true);
            form.reset();
            versioSelect.innerHTML = '<option value="">Selecciona primer un producte</option>';
            versioSelect.disabled = true;
            if (document.getElementById('audit-log-table')) {
                carregarRegistresAuditoria();
            }
        } catch (error) {
            console.error(`Error en assignar el producte:`, error);
            mostrarResultat(formId, `Error: ${error.message}`, false);
        }
    });

    // Càrrega inicial dels productes
    carregarProductes();
}

/**
 * Navegació per pestanyes al panell d'administració.
 */
function initAdminTabs() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const imagePlaceholder = document.querySelector('.admin-section-image');
    const sections = document.querySelectorAll('.form-section-card, .audit-section-card');

    // Funció per mostrar la secció correcta
    const showSection = (targetId) => {
        sections.forEach(section => {
            section.style.display = section.id === targetId.substring(1) ? 'block' : 'none';
        });

        // Amaguem la imatge si es mostra una secció, altrament la mostrem
        if (imagePlaceholder) {
            imagePlaceholder.style.display = targetId ? 'none' : 'block';
        }
    };

    // Lògica per als clics

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Si es fa clic a un enllaç ja actiu, no fem res (o podríem deseleccionar)
            if (link.classList.contains('active')) {
                return;
            }

            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');

            const targetId = link.getAttribute('href');
            showSection(targetId);
        });
    });

    // Estat inicial: mostra la secció de la pestanya activa per defecte
    const activeLink = document.querySelector('.sidebar-nav .nav-link.active');
    const initialTarget = activeLink ? activeLink.getAttribute('href') : null;
    showSection(initialTarget);
}

/**
 * Carrega i mostra els registres d'auditoria a la taula.
 * @param {number} limit - El nombre de registres a carregar.
 */
async function carregarRegistresAuditoria(limit = 50) {
    const tableBody = document.querySelector("#audit-log-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6">Carregant registres...</td></tr>';

    try {
        const response = await fetch(`/api/audit-logs?limit=${limit}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Error en la resposta del servidor.");
        }

        if (result.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No s\'han trobat registres d\'auditoria.</td></tr>';
            return;
        }

        tableBody.innerHTML = ""; // Neteja la taula

        result.data.forEach(log => {
            const row = document.createElement("tr");

            // Formata la data per a millor llegibilitat
            const dataFormatada = new Date(log.data_accio_nk).toLocaleString('ca-ES', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            row.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${log.id_admin_nk || 'Sistema'}</td>
                <td>${log.accio_nk}</td>
                <td>${log.taula_objectiu_nk}</td>
                <td>${log.id_objectiu_nk}</td>
                <td><pre>${JSON.stringify(JSON.parse(log.valor_nou_nk || '{}'), null, 2)}</pre></td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error en carregar els registres d'auditoria:", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="error-message">Error: ${error.message}</td></tr>`;
    }
}

/**
 * Inicialitza la secció d'auditoria, incloent la càrrega inicial i l'esdeveniment del selector.
 */
function initAuditoriaSection() {
    const limitSelect = document.getElementById('audit-limit-select');
    if (limitSelect) {
        // Càrrega inicial
        carregarRegistresAuditoria(limitSelect.value);

        // Esdeveniment per recarregar quan canvia la selecció
        limitSelect.addEventListener('change', () => carregarRegistresAuditoria(limitSelect.value));
    }
}

export function adminPage() {
    initAdminHeroAnimation();
    initAdminTabs();
    carregarSelectorsAdmin(); // Carrega tots els selectors d'admin
    // initNouAdminForm(); // Pendent d'implementar
    // initAssignarRolForm(); // Pendent d'implementar
    initAssignarEmailForm(); // <-- Afegim la inicialització del nou formulari
    initRegistrarProducteForm(); // <-- Afegim la inicialització del formulari de productes
    initAssignarProducteForm(); // <-- Afegim la inicialització del nou formulari d'assignació
    initAuditoriaSection(); // <-- Afegim la inicialització de la secció d'auditoria
}