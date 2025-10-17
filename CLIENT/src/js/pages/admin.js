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
 * Store simple per a les dades compartides a la pàgina d'administració.
 * Això evita crides múltiples a l'API per a les mateixes dades.
 */
const dataStore = {
    admins: null,
    roleDefinitions: null,
    products: null
};
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
 * @param {boolean} forceRefresh - Si és true, força la recàrrega des de l'API.
 */
async function carregarSelectorsAdmin(forceRefresh = false) {
    const selectors = document.querySelectorAll('select[name="firebase_uid_admin_nk"]');
    if (selectors.length === 0) return;

    if (dataStore.admins && !forceRefresh) {
        populateAdminSelectors(dataStore.admins);
        return;
    }

    try {
        const response = await fetch('/api/administradors');
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'No s\'ha pogut carregar la llista d\'administradors.');
        }
        dataStore.admins = result.data; // Guardem a la "store"
        return dataStore.admins;
    } catch (error) {
        console.error("Error en carregar administradors:", error);
        dataStore.admins = []; // Evita intents de recàrrega continus
        throw error; // Propaguem l'error
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
 * @param {boolean} forceRefresh - Si és true, força la recàrrega des de l'API.
 */
async function carregarSelectorsAdmin(forceRefresh = false) {
    const selectors = document.querySelectorAll('select[name="firebase_uid_admin_nk"]');
    if (selectors.length === 0) return;

    try {
        const admins = await carregarDadesAdmins(forceRefresh);
        populateAdminSelectors(admins);
    } catch (error) {
        selectors.forEach(select => {
            select.innerHTML = `<option value="">Error al carregar</option>`;
            select.disabled = true;
        });
    }
}

/**
 * Pobla els selectors d'administradors amb les dades proporcionades.
 * @param {Array} admins - La llista d'administradors.
 */
function populateAdminSelectors(admins) {
    const selectors = document.querySelectorAll('select[name="firebase_uid_admin_nk"]');
    selectors.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">-- Selecciona un administrador --</option>';
        admins.forEach(admin => {
            const option = document.createElement('option');
            option.value = admin.id_admin_nk;
            option.textContent = `${admin.nom_admin_nk} (${admin.email_admin_nk})`;
            select.appendChild(option);
        });
        select.value = currentValue; // Intenta restaurar el valor seleccionat
    });
}
/**
 * Inicialitza la lògica per al formulari de registre de nous administradors.
 */
function initNouAdminForm() {
    const form = document.getElementById('form-nou-admin');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const formId = form.id;

        // Validació de contrasenyes
        if (data.password !== data.confirmPassword) {
            mostrarResultat(formId, 'Les contrasenyes no coincideixen.', false);
            return;
        }

        mostrarResultat(formId, 'Registrant administrador...', true);

        // No enviem la confirmació de la contrasenya al backend
        delete data.confirmPassword;

        try {
            const response = await fetch('/api/registrarAdmin', {
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
            
            // Forcem la recàrrega de les dades d'administradors a tot arreu
            const admins = await carregarDadesAdmins(true);
            renderAdminsTable(admins);

        } catch (error) {
            console.error(`Error en registrar l'administrador:`, error);
            mostrarResultat(formId, `Error: ${error.message}`, false);
        }
    });
}

/**
 * Inicialitza la lògica per al formulari d'assignació de rols.
 */
async function initAssignarRolForm() {
    const form = document.getElementById('form-assignar-rol');
    const rolSelect = document.getElementById('rol-nivell');
    if (!form || !rolSelect) return;

    /**
     * Carrega les definicions de rols globals des de l'API i les guarda al store.
     * @param {boolean} forceRefresh - Si és true, força la recàrrega des de l'API.
     */
    async function carregarDadesRols(forceRefresh = false) {
        if (dataStore.roleDefinitions && !forceRefresh) {
            return dataStore.roleDefinitions;
        }
        try {
            const response = await fetch('/api/definicions-rols');
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);
            dataStore.roleDefinitions = result.data; // Guardem a la "store"
            return dataStore.roleDefinitions;
        } catch (error) {
            rolSelect.innerHTML = `<option value="">Error: ${error.message}</option>`;
            rolSelect.disabled = true;
        }
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        // Canviem el nom de la clau per coincidir amb el que espera el backend
        const data = {
            id_admin_nk: formData.get('firebase_uid_admin_nk'),
            nom_rol_nk: formData.get('nom_rol_nk'),
            notes_rol_nk: formData.get('notes_rol_nk')
        };
        const formId = form.id;

        mostrarResultat(formId, 'Processant...', true);

        try {
            const response = await fetch('/api/assignarRol', {
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

            // Recarregar la llista d'administradors per mostrar el nou rol
            const admins = await carregarDadesAdmins(true);
            renderAdminsTable(admins);
        } catch (error) {
            console.error(`Error en assignar el rol:`, error);
            mostrarResultat(formId, `Error: ${error.message}`, false);
        }
    });

    // Càrrega inicial dels rols
    async function carregarSelector() {
        const roles = await carregarDadesRols();
        populateRolSelector(roles);
    }

    carregarSelector();
}

/**
 * Pobla el selector de rols globals.
 * @param {Array} roles - La llista de definicions de rols.
 */
function populateRolSelector(roles) {
    const rolSelect = document.getElementById('rol-nivell');
    if (!rolSelect) return;

    rolSelect.innerHTML = '<option value="">-- Selecciona un nivell --</option>';
    if (roles.length === 0) {
        rolSelect.innerHTML = '<option value="">No hi ha rols definits</option>';
        rolSelect.disabled = true;
    } else {
        roles.forEach(rol => {
            const option = document.createElement('option');
            option.value = rol.nom_rol_def_nk;
            option.textContent = rol.nom_rol_def_nk;
            rolSelect.appendChild(option);
        });
        rolSelect.disabled = false;
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

    // 1. Funció per carregar productes des de l'API i guardar-los al store
    async function carregarDadesProductes(forceRefresh = false) {
        if (dataStore.products && !forceRefresh) {
            return dataStore.products;
        }
        try {
            const response = await fetch('/api/productes');
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);
            dataStore.products = result.data;
            return dataStore.products;
        } catch (error) {
            projecteSelect.innerHTML = `<option value="">Error: ${error.message}</option>`;
            projecteSelect.disabled = true;
            dataStore.products = [];
            throw error;
        }
    }

    function populateProductSelector(products) {
        projecteSelect.innerHTML = '<option value="">-- Selecciona un producte --</option>';
        products.forEach(proj => {
            const option = document.createElement('option');
            option.value = proj.id_proj_nk;
            option.textContent = proj.nom_producte_proj_nk;
            projecteSelect.appendChild(option);
        });
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
    async function carregarSelector() {
        try {
            const products = await carregarDadesProductes();
            populateProductSelector(products);
        } catch (error) { /* L'error ja es gestiona a carregarDadesProductes */ }
    }
    carregarSelector();
}

/**
 * Navegació per pestanyes al panell d'administració.
 */
function initAdminTabs() {
    const imagePlaceholder = document.querySelector('.admin-section-image');

    // Funció per mostrar la secció correcta
    const showSection = (targetId) => {
        const sections = document.querySelectorAll('.form-section-card, .audit-section-card');
        sections.forEach(section => {
            section.style.display = section.id === targetId.substring(1) ? 'block' : 'none';
        });
        // Amaguem la imatge si es mostra una secció
        if (imagePlaceholder) imagePlaceholder.style.display = 'none';
    };

    // Lògica per als clics
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Si es fa clic a un enllaç ja actiu, no fem res (o podríem deseleccionar)
            if (link.classList.contains('active')) {
                return;
            }

            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');

            showSection(link.getAttribute('href'));
        });
    });

    // Estat inicial: mostra la secció de la pestanya activa per defecte
    const activeLink = document.querySelector('.sidebar-nav .nav-link.active');
    if (activeLink) {
        showSection(activeLink.getAttribute('href'));
    } else if (imagePlaceholder) {
        // Si no hi ha cap actiu, ens assegurem que la imatge sigui visible
        imagePlaceholder.style.display = 'block';
    }
}

/**
 * Carrega i mostra els registres d'auditoria a la taula.
 * @param {number} page - El número de pàgina a carregar.
 * @param {number} limit - El nombre de registres per pàgina.
 */
async function carregarRegistresAuditoria(page = 1, limit = 25) {
    const tableBody = document.querySelector("#audit-log-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6">Carregant registres...</td></tr>';

    try {
        const response = await fetch(`/api/audit-logs?page=${page}&limit=${limit}`);
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

        // Renderitzar els controls de paginació
        renderAuditPagination(result.pagination);

    } catch (error) {
        console.error("Error en carregar els registres d'auditoria:", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="error-message">Error: ${error.message}</td></tr>`;
    }
}

/**
 * Renderitza els controls de paginació per a la taula d'auditoria.
 * @param {object} pagination - L'objecte de paginació de l'API.
 */
function renderAuditPagination(pagination) {
    const { currentPage, totalPages } = pagination;
    const container = document.getElementById('audit-pagination-controls');
    if (!container) return;

    container.innerHTML = '';

    if (totalPages <= 1) return; // No mostrar controls si només hi ha una pàgina

    // Botó 'Anterior'
    const prevButton = document.createElement('button');
    prevButton.textContent = '« Anterior';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => carregarRegistresAuditoria(currentPage - 1));
    container.appendChild(prevButton);

    // Botons de pàgines
    for (let i = 1; i <= totalPages; i++) {
        // Lògica per mostrar només un rang de pàgines si n'hi ha moltes (opcional, però recomanat)
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.disabled = true;
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => carregarRegistresAuditoria(i));
            container.appendChild(pageButton);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            container.appendChild(ellipsis);
        }
    }

    // Botó 'Següent'
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Següent »';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => carregarRegistresAuditoria(currentPage + 1));
    container.appendChild(nextButton);
}

/**
 * Inicialitza la secció d'auditoria, incloent la càrrega inicial i l'esdeveniment del selector.
 */
function initAuditoriaSection() {
    const auditSection = document.getElementById('section-auditoria');
    if (!auditSection) return;

    // Càrrega inicial en fer visible la secció
    // (Això es podria millorar amb un IntersectionObserver com a 'initVeureAdmins')
    carregarRegistresAuditoria(1);
}

/**
 * Renderitza la taula d'administradors amb les dades proporcionades.
 * @param {Array} admins - L'array d'administradors.
 */
function renderAdminsTable(admins) {
    const tableBody = document.querySelector("#admin-list-table tbody");
    if (!tableBody) return;

    if (admins.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No s\'han trobat administradors.</td></tr>';
        return;
    }

    tableBody.innerHTML = ""; // Neteja la taula

    admins.forEach(admin => {
        const row = document.createElement("tr");
        row.dataset.adminId = admin.id_admin_nk; // Guardem l'ID per a accions
        const dataFormatada = new Date(admin.data_creacio_admin_nk).toLocaleString('ca-ES', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        const rolsHtml = admin.rols.length > 0
            ? `<div class="role-pill-container">` + admin.rols.map(rol => `
                <span class="role-pill">
                    ${rol.nom_rol_nk}
                    <button class="role-delete-btn" data-rol-id="${rol.id_rol_nk}" title="Eliminar rol">&times;</button>
                </span>
            `).join('') + `</div>`
            : '<em>Sense rol</em>';

        row.innerHTML = `
            <td>${admin.id_admin_nk}</td>
            <td>${admin.nom_admin_nk}</td>
            <td>${admin.email_admin_nk}</td>
            <td>${rolsHtml}</td>
            <td>${dataFormatada}</td>
            <td>${admin.notes_admin_nk || ''}</td>
            <td>
                <button class="button-secondary button-small" data-action="edit">Editar</button>
                <button class="button-danger button-small" data-action="delete">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Inicialitza la secció per veure tots els administradors.
 */
function initVeureAdmins() {
    const section = document.getElementById('section-veure-admins');
    const tableBody = document.querySelector("#admin-list-table tbody");
    if (!section || !tableBody) return;

    const carregarIRenderitzar = async (forceRefresh = false) => {
        tableBody.innerHTML = '<tr><td colspan="7">Carregant administradors...</td></tr>';
        try {
            const admins = await carregarDadesAdmins(forceRefresh);
            renderAdminsTable(admins);
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="7" class="error-message">Error: ${error.message}</td></tr>`;
        }
    }

    // Gestor d'esdeveniments per als botons d'eliminar
    tableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('button[data-action], button.role-delete-btn');
        if (!button) return;

        const action = button.dataset.action;
        const row = button.closest('tr');
        const adminId = row.dataset.adminId;

        if (action === 'edit') {
            openEditModal(adminId, row);
        } else if (action === 'delete') {
            const adminEmail = row.cells[2].textContent;

            if (confirm(`Estàs segur que vols eliminar l'administrador "${adminEmail}"? Aquesta acció no es pot desfer.`)) {
                button.disabled = true;
                button.textContent = 'Eliminant...';

                try {
                    const response = await fetch(`/api/administradors/${adminId}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();

                    if (!response.ok || !result.success) {
                        throw new Error(result.message || 'Error desconegut del servidor.');
                    }

                    // Elimina la fila de la taula si l'operació ha tingut èxit
                    alert(result.message); // Mostra missatge d'èxit
                    // Forcem recàrrega de dades
                    const admins = await carregarDadesAdmins(true);
                    renderAdminsTable(admins);

                } catch (error) {
                    console.error("Error en eliminar l'administrador:", error);
                    alert(`Error: ${error.message}`);
                    button.disabled = false;
                    button.textContent = 'Eliminar';
                }
            }
        } else if (button.classList.contains('role-delete-btn')) { // Botó Eliminar Rol
            const rolId = button.dataset.rolId;
            const rolPill = button.closest('.role-pill');
            const rolName = rolPill.textContent.replace('×', '').trim();

            if (confirm(`Estàs segur que vols eliminar el rol "${rolName}"?`)) {
                button.disabled = true;

                try {
                    const response = await fetch(`/api/rols/${rolId}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();

                    if (!response.ok || !result.success) {
                        throw new Error(result.message || 'Error desconegut del servidor.');
                    }

                    // Elimina la píndola del DOM
                    rolPill.remove();
                    alert(result.message);

                } catch (error) {
                    console.error("Error en eliminar el rol:", error);
                    alert(`Error: ${error.message}`);
                    button.disabled = false;
                }
            }
        }
    });

    // Observador per carregar les dades només quan la secció es fa visible
    // Només configurem l'observador si no n'hi ha ja un
    if (!section.observer) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !dataStore.admins) {
                carregarIRenderitzar();
            } else if (entries[0].isIntersecting) {
                renderAdminsTable(dataStore.admins);
            }
        }, { threshold: 0.1 });
        
        section.observer = observer; // Guardem l'observador
        observer.observe(section);
    }
}

/**
 * Obre i gestiona el modal per editar un administrador.
 * @param {string} adminId - L'ID de l'administrador a editar.
 * @param {HTMLElement} tableRow - La fila de la taula corresponent a l'admin.
 */
function openEditModal(adminId, tableRow) {
    const modal = document.getElementById('edit-admin-modal');
    const form = document.getElementById('form-edit-admin');
    const closeButton = document.getElementById('modal-close-btn');
    if (!modal || !form || !closeButton) return;

    // Funció per tancar el modal
    const closeModal = () => {
        modal.style.display = 'none';
        form.removeEventListener('submit', formSubmitHandler); // Neteja l'event listener
    };

    // Obtenir dades actuals de la fila per omplir el formulari
    const cells = tableRow.getElementsByTagName('td');
    document.getElementById('edit-admin-id').value = adminId;
    document.getElementById('edit-nom').value = cells[1].textContent;
    document.getElementById('edit-email').value = cells[2].textContent;
    document.getElementById('edit-notes').value = cells[4].textContent;

    // Mostra el modal
    modal.style.display = 'flex';
    mostrarResultat('form-edit-admin', '', true); // Neteja missatges anteriors

    // Tancar el modal amb el botó o clicant fora
    closeButton.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    // Gestor per a l'enviament del formulari
    const formSubmitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const formId = form.id;

        mostrarResultat(formId, 'Guardant canvis...', true);

        try {
            const response = await fetch(`/api/administradors/${adminId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error desconegut del servidor.');
            }

            // Actualitzar la fila de la taula amb les noves dades
            // En lloc d'actualitzar la fila manualment, recarreguem les dades
            // i deixem que el renderitzador faci la feina.
            const admins = await carregarDadesAdmins(true);
            renderAdminsTable(admins);
            populateAdminSelectors(admins); // Actualitzem també els selectors

            mostrarResultat(formId, result.message, true);
            setTimeout(closeModal, 1500); // Tanca el modal després d'un breu instant

        } catch (error) {
            console.error(`Error en editar l'administrador:`, error);
            mostrarResultat(formId, `Error: ${error.message}`, false);
        }
    };

    // Afegim l'event listener al formulari
    form.addEventListener('submit', formSubmitHandler);
}

/**
 * Obre i gestiona el modal per editar una definició de rol global.
 * @param {string} rolId - L'ID del rol global a editar.
 * @param {HTMLElement} tableRow - La fila de la taula corresponent al rol.
 */
function openEditRolGlobalModal(rolId, tableRow) {
    const modal = document.getElementById('edit-rol-global-modal');
    const form = document.getElementById('form-edit-rol-global');
    const closeButton = document.getElementById('modal-close-rol-global-btn');
    if (!modal || !form || !closeButton) return;

    // Funció per tancar el modal
    const closeModal = () => {
        modal.style.display = 'none';
        form.removeEventListener('submit', formSubmitHandler); // Neteja l'event listener
    };

    // Obtenir dades actuals de la fila per omplir el formulari
    const cells = tableRow.getElementsByTagName('td');
    document.getElementById('edit-rol-global-id').value = rolId;
    document.getElementById('edit-rol-global-nom').value = cells[0].textContent;
    document.getElementById('edit-rol-global-descripcio').value = cells[1].textContent;

    // Mostra el modal
    modal.style.display = 'flex';
    mostrarResultat('form-edit-rol-global', '', true); // Neteja missatges anteriors

    // Tancar el modal amb el botó o clicant fora
    closeButton.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    // Gestor per a l'enviament del formulari
    const formSubmitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const formId = form.id;

        mostrarResultat(formId, 'Guardant canvis...', true);

        try {
            const response = await fetch(`/api/definicions-rols/${rolId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error desconegut del servidor.');
            }

            // Actualitzar la fila de la taula amb les noves dades
            const updatedRol = result.data;
            cells[0].textContent = updatedRol.nom_rol_def_nk;
            cells[1].textContent = updatedRol.descripcio_rol_def_nk || '';

            mostrarResultat(formId, result.message, true);
            setTimeout(closeModal, 1500); // Tanca el modal després d'un breu instant

        } catch (error) {
            console.error(`Error en editar el rol global:`, error);
            mostrarResultat(formId, `Error: ${error.message}`, false);
        }
    };

    // Afegim l'event listener al formulari
    form.addEventListener('submit', formSubmitHandler);
}

/**
 * Inicialitza la secció per gestionar les definicions de rols globals.
 */
function initGestionarRolsGlobals() {
    const section = document.getElementById('section-gestionar-rols-globals');
    const form = document.getElementById('form-crear-rol-global');
    const tableBody = document.querySelector('#rols-globals-table tbody');

    if (!section || !form || !tableBody) return;

    const carregarIRenderitzar = async (forceRefresh = false) => {
        tableBody.innerHTML = '<tr><td colspan="3">Carregant rols...</td></tr>';
        try {
            const roles = await carregarDadesRols(forceRefresh);
            renderRolsGlobalsTable(roles);
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="3" class="error-message">Error: ${error.message}</td></tr>`;
        }
    };

    const renderRolsGlobalsTable = (roles) => { // Aquesta funció ja existia, la mantenim
        tableBody.innerHTML = '';
        if (roles.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">No hi ha definicions de rols creades.</td></tr>';
        } else {
            roles.forEach(rol => {
                const row = document.createElement('tr');
                row.dataset.rolId = rol.id_rol_def_nk;
                row.innerHTML = `
                    <td>${rol.nom_rol_def_nk}</td>
                    <td>${rol.descripcio_rol_def_nk || ''}</td>
                    <td>
                        <button class="button-secondary button-small" data-action="edit">Editar</button>
                        <button class="button-danger button-small" data-action="delete">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    };

    // Gestió del formulari de creació
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const formId = form.id;

        mostrarResultat(formId, 'Creant rol...', true);

        try {
            const response = await fetch('/api/definicions-rols', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);

            mostrarResultat(formId, result.message, true);
            form.reset();
            await carregarIRenderitzar(true); // Forcem recàrrega
        } catch (error) {
            mostrarResultat(formId, `Error: ${error.message}`, false);
        }
    });

    // Gestió dels botons d'editar i eliminar
    tableBody.addEventListener('click', async (e) => {
        const button = e.target;
        const action = button.dataset.action;
        if (!action) return;

        const row = button.closest('tr');
        const rolId = row.dataset.rolId;
        const rolName = row.cells[0].textContent;

        if (action === 'delete') {
            if (confirm(`Estàs segur que vols eliminar el rol "${rolName}"? Aquesta acció no es pot desfer.`)) {
                try {
                    const response = await fetch(`/api/definicions-rols/${rolId}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (!response.ok || !result.success) throw new Error(result.message);
                    alert(result.message);
                    await carregarIRenderitzar(true); // Forcem recàrrega
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            }
        }
        else if (action === 'edit') {
            openEditRolGlobalModal(rolId, row);
        }
    });

    // Càrrega inicial quan la secció es fa visible
    if (!section.observer) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                carregarIRenderitzar();
            } else if (entries[0].isIntersecting) {
                renderRolsGlobalsTable(dataStore.roleDefinitions);
            }
        }, { threshold: 0.1 });
        section.observer = observer;
        observer.observe(section);
    }
}

/**
 * Obre i gestiona el modal per editar un producte.
 * @param {string} productId - L'ID del producte a editar.
 * @param {HTMLElement} tableRow - La fila de la taula corresponent al producte.
 */
function openEditProducteModal(productId, tableRow) {
    const modal = document.getElementById('edit-producte-modal');
    const form = document.getElementById('form-edit-producte');
    const closeButton = document.getElementById('modal-close-producte-btn');
    if (!modal || !form || !closeButton) return;

    const closeModal = () => {
        modal.style.display = 'none';
        form.removeEventListener('submit', formSubmitHandler);
    };

    const cells = tableRow.getElementsByTagName('td');
    document.getElementById('edit-producte-id').value = productId;
    document.getElementById('edit-producte-nom').value = cells[0].textContent;
    document.getElementById('edit-producte-email').value = cells[1].textContent;
    document.getElementById('edit-producte-notes').value = cells[5].textContent;

    modal.style.display = 'flex';
    mostrarResultat('form-edit-producte', '', true);

    closeButton.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    const formSubmitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const formId = form.id;

        mostrarResultat(formId, 'Guardant canvis...', true);

        try {
            const response = await fetch(`/api/productes/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);

            const updated = result.data;
            cells[0].textContent = updated.nom_producte_proj_nk;
            cells[1].textContent = updated.email_producte_proj_nk || '';
            cells[5].textContent = updated.notes_producte_proj_nk || '';

            mostrarResultat(formId, result.message, true);
            setTimeout(closeModal, 1500);
        } catch (error) {
            mostrarResultat(formId, `Error: ${error.message}`, false);
        }
    };

    form.addEventListener('submit', formSubmitHandler);
}

/**
 * Inicialitza la secció per gestionar els productes registrats.
 */
function initGestionarProductes() {
    const section = document.getElementById('section-gestionar-productes');
    const tableBody = document.querySelector('#product-list-table tbody');
    if (!section || !tableBody) return;

    const carregarIRenderitzar = async (forceRefresh = false) => {
        tableBody.innerHTML = '<tr><td colspan="7">Carregant productes...</td></tr>';
        try {
            // Nota: Aquesta crida hauria de ser a una funció `carregarDadesProductesDetallats`
            // Per simplicitat, la deixem aquí, però idealment seguiria el mateix patró.
            const response = await fetch('/api/productes-detallats'); // Aquesta API és diferent de la dels selectors
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);
            renderProductesTable(result.data);
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="7" class="error-message">Error: ${error.message}</td></tr>`;
        }
    };

    const renderProductesTable = (products) => {
        tableBody.innerHTML = '';
        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7">No hi ha productes registrats.</td></tr>';
        } else {
            products.forEach(prod => {
                const row = document.createElement('tr');
                row.dataset.productId = prod.id_proj_nk;
                const dataFormatada = new Date(prod.data_creacio_proj_nk).toLocaleDateString('ca-ES');
                row.innerHTML = `
                    <td>${prod.nom_producte_proj_nk}</td>
                    <td>${prod.email_producte_proj_nk || ''}</td>
                    <td>${prod.creador_nom}</td>
                    <td>${prod.versions_count}</td>
                    <td>${dataFormatada}</td>
                    <td>${prod.notes_producte_proj_nk || ''}</td>
                    <td>
                        <button class="button-secondary button-small" data-action="view-versions">Versions</button>
                        <button class="button-secondary button-small" data-action="edit">Editar</button>
                        <button class="button-danger button-small" data-action="delete">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    };

    tableBody.addEventListener('click', async (e) => {
        const button = e.target;
        const action = button.dataset.action;
        if (!action) return;

        const row = button.closest('tr');
        const productId = row.dataset.productId;
        const productName = row.cells[0].textContent;

        if (action === 'edit') {
            openEditProducteModal(productId, row);
        } else if (action === 'delete') {
            if (confirm(`Estàs segur que vols eliminar el producte "${productName}"? S'eliminaran també totes les seves versions. Aquesta acció no es pot desfer.`)) {
                try {
                    const response = await fetch(`/api/productes/${productId}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (!response.ok || !result.success) throw new Error(result.message);
                    alert(result.message);
                    await carregarIRenderitzar(true);
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            }
        } else if (action === 'view-versions') {
            openVersionsModal(productId, productName);
        }
    });

    if (!section.observer) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                carregarIRenderitzar();
            }
        }, { threshold: 0.1 });
        section.observer = observer;
        observer.observe(section);
    }
}

/**
 * Obre i gestiona el modal per editar una versió.
 * @param {object} versio - L'objecte de la versió a editar.
 * @param {function} onUpdateCallback - Funció a cridar després d'actualitzar.
 */
function openEditVersioModal(versio, onUpdateCallback) {
    const modal = document.getElementById('edit-versio-modal');
    const form = document.getElementById('form-edit-versio');
    const closeButton = document.getElementById('modal-close-versio-btn');
    if (!modal || !form || !closeButton) return;

    const closeModal = () => {
        modal.style.display = 'none';
        form.removeEventListener('submit', formSubmitHandler);
    };

    document.getElementById('edit-versio-id').value = versio.id_versio_nk;
    document.getElementById('edit-versio-nom').value = versio.nom_versio_nk;
    // El README ve com un objecte JSON { content: "..." } o null
    const readmeContent = versio.readme_versio_nk ? versio.readme_versio_nk.content : '';
    document.getElementById('edit-versio-readme').value = readmeContent;

    modal.style.display = 'flex';
    mostrarResultat('form-edit-versio', '', true);

    closeButton.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    const formSubmitHandler = async (e) => {
        e.preventDefault();
        const formId = form.id;
        const versioId = document.getElementById('edit-versio-id').value;
        const data = {
            nom_versio_nk: document.getElementById('edit-versio-nom').value,
            readme_versio_nk: document.getElementById('edit-versio-readme').value
        };

        mostrarResultat(formId, 'Guardant canvis...', true);

        try {
            const response = await fetch(`/api/versions/${versioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);

            mostrarResultat(formId, result.message, true);
            if (onUpdateCallback) onUpdateCallback(); // Recarrega la llista de versions
            setTimeout(closeModal, 1500);

        } catch (error) {
            mostrarResultat(formId, `Error: ${error.message}`, false);
        }
    };

    form.addEventListener('submit', formSubmitHandler);
}

/**
 * Renderitza la llista de versions a la taula del modal.
 * @param {Array} versions - Array d'objectes de versió.
 * @param {HTMLElement} listBody - L'element <tbody> de la taula.
 */
function renderVersionsList(versions, listBody) {
    listBody.innerHTML = ''; // Neteja la llista abans de renderitzar

    if (versions.length === 0) {
        listBody.innerHTML = '<tr><td colspan="3">Aquest producte no té versions registrades.</td></tr>';
        return;
    }

    versions.forEach(versio => {
        const row = document.createElement('tr');
        row.dataset.versionId = versio.id_versio_nk;
        const dataFormatada = new Date(versio.data_versio_nk).toLocaleString('ca-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        row.innerHTML = `
            <td>${versio.nom_versio_nk}</td>
            <td>${dataFormatada}</td>
            <td>
                <button class="button-secondary button-small" data-action="edit-version">Editar</button>
                <button class="button-danger button-small" data-action="delete-version">Eliminar</button>
            </td>
        `;
        listBody.appendChild(row);
    });
}

/**
 * Gestor d'esdeveniments per a les accions de la llista de versions (editar, eliminar).
 * @param {Event} e - L'esdeveniment de clic.
 * @param {Array} versions - L'array de versions actuals per trobar la correcta.
 * @param {Function} onUpdate - Callback per recarregar la llista després d'una acció.
 */
async function handleVersionActions(e, versions, onUpdate) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const row = button.closest('tr');
    const versionId = row.dataset.versionId;
    const versio = versions.find(v => v.id_versio_nk == versionId);

    if (action === 'edit-version') {
        openEditVersioModal(versio, onUpdate);
    } else if (action === 'delete-version') {
        if (confirm(`Estàs segur que vols eliminar la versió "${versio.nom_versio_nk}"? Aquesta acció no es pot desfer.`)) {
            try {
                const response = await fetch(`/api/versions/${versionId}`, { method: 'DELETE' });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.message);
                alert(result.message);
                onUpdate(); // Recarregar la llista
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    }
}

/**
 * Gestiona l'enviament del formulari per crear una nova versió.
 * @param {HTMLFormElement} form - El formulari de creació.
 * @param {string} productId - L'ID del producte al qual pertany la nova versió.
 * @param {Function} onUpdate - Callback per recarregar la llista de versions.
 */
function handleCreateVersionForm(form, productId, onUpdate) {
    const formSubmitHandler = async (e) => {
        e.preventDefault();
        const formId = form.id;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.nom_versio_nk.trim()) {
            mostrarResultat(formId, 'El nom de la versió no pot estar buit.', false);
            return;
        }

        mostrarResultat(formId, 'Creant versió...', true);

        try {
            const response = await fetch(`/api/productes/${productId}/versions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);

            mostrarResultat(formId, result.message, true);
            form.reset();
            onUpdate(); // Recarregar la llista de versions
        } catch (error) {
            mostrarResultat(formId, `Error: ${error.message}`, false);
        }
    };
    form.addEventListener('submit', formSubmitHandler);
    return formSubmitHandler; // Retornem el handler per poder-lo eliminar després
}

/**
 * Obre i gestiona el modal per veure les versions d'un producte.
 * @param {string} productId - L'ID del producte.
 * @param {string} productName - El nom del producte per al títol del modal.
 */
async function openVersionsModal(productId, productName) {
    const modal = document.getElementById('versions-producte-modal');
    const modalTitle = document.getElementById('versions-modal-title');
    const listBody = document.getElementById('versions-list-body');
    const createVersionForm = document.getElementById('form-crear-versio');
    const closeButton = document.getElementById('modal-close-versions-btn');
    if (!modal || !modalTitle || !listBody || !createVersionForm || !closeButton) return;

    let currentVersions = [];
    let formSubmitHandler;
    let listClickHandler;

    // Funció per tancar i netejar
    const closeModal = () => {
        modal.style.display = 'none';
        if (formSubmitHandler) createVersionForm.removeEventListener('submit', formSubmitHandler);
        if (listClickHandler) listBody.removeEventListener('click', listClickHandler);
    };

    // Funció per carregar les dades i configurar els esdeveniments
    const carregarDadesIMostrar = async () => {
        listBody.innerHTML = '<tr><td colspan="3">Carregant...</td></tr>';
        try {
            const response = await fetch(`/api/productes/${productId}/versions`);
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);

            currentVersions = result.data;
            renderVersionsList(currentVersions, listBody);

            // Neteja listeners antics i afegeix els nous
            if (listClickHandler) listBody.removeEventListener('click', listClickHandler);
            listClickHandler = (e) => handleVersionActions(e, currentVersions, carregarDadesIMostrar);
            listBody.addEventListener('click', listClickHandler);

        } catch (error) {
            listBody.innerHTML = `<tr><td colspan="3" class="error-message">Error: ${error.message}</td></tr>`;
        }
    };

    // Preparació inicial del modal
    modalTitle.textContent = `Versions de "${productName}"`;
    modal.style.display = 'flex';
    mostrarResultat('form-crear-versio', '', true);
    createVersionForm.reset();

    // Configuració d'esdeveniments del modal
    closeButton.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    if (formSubmitHandler) createVersionForm.removeEventListener('submit', formSubmitHandler);
    formSubmitHandler = handleCreateVersionForm(createVersionForm, productId, carregarDadesIMostrar);

    // Càrrega inicial
    await carregarDadesIMostrar();
}