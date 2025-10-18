// client/src/js/pages/admin.js
import { initTypingEffect } from "../components/typing-effect.js";
import { initAdminAuth, adminLogout } from '../auth/adminAuth.js';

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

function mostrarResultat(formId, message, isSuccess) {
    const resultatDiv = document.querySelector(`#${formId} + .form-resultat, #${formId} .form-resultat`);
    if (resultatDiv) {
        resultatDiv.textContent = message;
        resultatDiv.className = 'form-resultat';
        resultatDiv.classList.add(isSuccess ? 'success' : 'error');
        resultatDiv.style.display = 'block';
    }
}

async function carregarSelectorsAdmin() {
    const selectors = document.querySelectorAll('select[name="firebase_uid_admin_nk"]');
    if (selectors.length === 0) {
        console.warn('No admin selectors found');
        return;
    }

    try {
        const response = await fetch('/api/administradors');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'No s\'ha pogut carregar la llista d\'administradors.');
        }

        selectors.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">-- Selecciona un administrador --</option>';
            result.data.forEach(admin => {
                const option = document.createElement('option');
                option.value = admin.firebase_uid_admin_nk;
                option.textContent = `${admin.nom_admin_nk} (${admin.email_admin_nk})`;
                select.appendChild(option);
            });
            select.value = currentValue;
        });

    } catch (error) {
        console.error('Error loading admin selectors:', error);
        selectors.forEach(select => {
            select.innerHTML = `<option value="">Error: ${error.message}</option>`;
            select.disabled = true;
        });
    }
}

async function carregarSelectorsRols() {
    const selector = document.getElementById('rol-nivell');
    if (!selector) return;

    try {
        const response = await fetch('/api/definicions-rols');
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        selector.innerHTML = '<option value="">-- Selecciona un rol --</option>';
        result.data.forEach(rol => {
            const option = document.createElement('option');
            option.value = rol.nom_rol_def_nk;
            option.textContent = rol.nom_rol_def_nk;
            selector.appendChild(option);
        });
    } catch (error) {
        console.error("Error en carregar rols:", error);
        selector.innerHTML = `<option value="">Error: ${error.message}</option>`;
        selector.disabled = true;
    }
}

function initApiFormHandler(formId, apiEndpoint, options = {}) {
    const form = document.getElementById(formId);
    if (!form) {
        console.warn(`Form with id ${formId} not found`);
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        let data = Object.fromEntries(formData.entries());

        if (options.prepareData) {
            data = options.prepareData(formData, data);
        }

        mostrarResultat(formId, 'Processant...', true);

        try {
            const response = await fetch(apiEndpoint, {
                method: options.method || 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error desconegut del servidor.');
            }

            mostrarResultat(formId, result.message, true);
            if (options.onSuccess) options.onSuccess(result);

        } catch (error) {
            console.error(`Error en el formulari ${formId}:`, error);
            mostrarResultat(formId, `Error: ${error.message}`, false);
        }
    });
}

function initNouAdminForm() {
    initApiFormHandler('form-nou-admin', '/api/registrarAdmin', {
        onSuccess: (result) => {
            document.getElementById('form-nou-admin').reset();
            carregarTaulaAdmins();
            carregarSelectorsAdmin();
        }
    });
    
    const form = document.getElementById('form-nou-admin');
    if (!form) return;

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const strengthMeter = document.getElementById('password-strength-meter');
    const strengthText = document.getElementById('password-strength-text');

    // Funció per mostrar/ocultar contrasenya
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                btn.textContent = '🙈';
            } else {
                targetInput.type = 'password';
                btn.textContent = '👁️';
            }
        });
    });

    if (passwordInput && confirmPasswordInput && confirmPasswordError) {
        const validatePasswords = () => {
            if (passwordInput.value && confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordError.style.display = 'block';
                confirmPasswordInput.setCustomValidity('Les contrasenyes no coincideixen.');
            } else {
                confirmPasswordError.style.display = 'none';
                confirmPasswordInput.setCustomValidity('');
            }
        };

        const checkPasswordStrength = () => {
            const pass = passwordInput.value;
            let score = 0;
            if (pass.length >= 8) score++;
            if (/[A-Z]/.test(pass)) score++;
            if (/[a-z]/.test(pass)) score++;
            if (/[0-9]/.test(pass)) score++;
            if (/[^A-Za-z0-9]/.test(pass)) score++;

            let width = (score / 5) * 100;
            let color = 'var(--color-accent-danger)';
            let text = 'Feble';
            if (score >= 3) { color = 'orange'; text = 'Mitjana'; }
            if (score >= 4) { color = 'var(--color-accent-success)'; text = 'Forta'; }
            
            strengthMeter.style.width = `${width}%`;
            strengthMeter.style.backgroundColor = color;
            strengthText.textContent = pass.length > 0 ? `Força: ${text}` : '';
            strengthText.style.color = color;
        };

        passwordInput.addEventListener('input', () => { checkPasswordStrength(); validatePasswords(); });
        confirmPasswordInput.addEventListener('input', validatePasswords);
    }
}

function initCrearRolGlobalForm() {
    initApiFormHandler('form-crear-rol-global', '/api/definicions-rols', {
        onSuccess: () => {
            document.getElementById('form-crear-rol-global').reset();
            carregarTaulaRolsGlobals();
            carregarSelectorsRols();
        }
    });
}

function initAssignarRolForm() {
    initApiFormHandler('form-assignar-rol', '/api/assignarRol', {
        onSuccess: () => {
            document.getElementById('form-assignar-rol').reset();
            carregarTaulaAdmins();
        }
    });
}

function initAssignarEmailForm() {
    initApiFormHandler('form-assignar-email', '/api/assignarEmail', {
        onSuccess: () => {
            document.getElementById('form-assignar-email').reset();
            carregarTaulaAdmins();
        }
    });
}

function initRegistrarProducteForm() {
    initApiFormHandler('form-registrar-producte', '/api/registrarProducte', {
        onSuccess: () => {
            document.getElementById('form-registrar-producte').reset();
            carregarTaulaProductes();
        }
    });
}

function initAssignarProducteForm() {
    const form = document.getElementById('form-assignar-producte');
    const projecteSelect = document.getElementById('projecte-select-assignar');
    const versioSelect = document.getElementById('versio-select-assignar');

    if (!form || !projecteSelect || !versioSelect) return;

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

    initApiFormHandler('form-assignar-producte', '/api/assignarProducte', {
        onSuccess: () => {
            form.reset();
            versioSelect.innerHTML = '<option value="">Selecciona primer un producte</option>';
            versioSelect.disabled = true;
        }
    });

    carregarProductes();
}

function initAdminTabs() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const sections = document.querySelectorAll('.dashboard-main .main-content > section');
    
    // Inicializar secciones colapsables
    sections.forEach(section => {
        const title = section.querySelector('h2');
        if (title) {
            title.addEventListener('click', () => {
                // Si la sección ya está activa, no hacer nada
                if (section.classList.contains('active')) {
                    return;
                }
                
                // Cerrar todas las secciones
                sections.forEach(s => {
                    if (s !== section) {
                        s.classList.remove('active');
                    }
                });
                
                // Abrir la sección actual
                section.classList.add('active');
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    });

    // Manejar navegación desde el menú
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Cerrar todas las secciones excepto la objetivo
                sections.forEach(section => {
                    if (section !== targetSection) {
                        section.classList.remove('active');
                    }
                });
                
                // Abrir la sección objetivo
                targetSection.classList.add('active');
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Ensure first section is active if none active
    if (sections.length > 0 && !document.querySelector('.form-section-card.active, .audit-section-card.active')) {
        sections[0].classList.add('active');
        if (navLinks[0]) navLinks[0].classList.add('active');
    }
}

async function carregarTaulaAdmins() {
    const tableBody = document.querySelector("#admin-list-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="7">Carregant administradors...</td></tr>';
    try {
        const response = await fetch('/api/administradors');
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        if (result.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7">No hi ha administradors registrats.</td></tr>';
            return;
        }

        tableBody.innerHTML = "";
        result.data.forEach(admin => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${admin.id_admin_nk}</td>
                <td>${admin.nom_admin_nk}</td>
                <td>${admin.email_admin_nk}</td>
                <td>${admin.rols ? admin.rols.join(', ') : 'N/A'}</td>
                <td>${new Date(admin.data_creacio_admin_nk).toLocaleDateString()}</td>
                <td>${admin.notes_admin_nk || ''}</td>
                <td>
                    <button class="button-small" data-action="edit-admin" data-id="${admin.id_admin_nk}">Editar</button>
                    <button class="button-small button-danger" data-action="delete-admin" data-id="${admin.id_admin_nk}">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="7" class="error-message">Error: ${error.message}</td></tr>`;
    }
}

async function carregarTaulaRolsGlobals() {
    const tableBody = document.querySelector("#rols-globals-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="3">Carregant rols...</td></tr>';
    try {
    const response = await fetch('/api/definicions-rols');
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        tableBody.innerHTML = "";
        result.data.forEach(rol => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${rol.nom_rol_def_nk}</td>
                <td>${rol.descripcio_rol_def_nk || ''}</td>
                <td>
                    <button class="button-small" data-action="edit-rol-global" data-id="${rol.id_rol_def_nk}">Editar</button>
                    <button class="button-small button-danger" data-action="delete-rol-global" data-id="${rol.id_rol_def_nk}">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="3" class="error-message">Error: ${error.message}</td></tr>`;
    }
}

async function carregarTaulaProductes() {
    const tableBody = document.querySelector("#product-list-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="7">Carregant productes...</td></tr>';
    try {
        const response = await fetch('/api/productes');
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        tableBody.innerHTML = "";
        result.data.forEach(producte => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${producte.nom_producte_proj_nk}</td>
                <td>${producte.email_producte_proj_nk || 'N/A'}</td>
                <td>${producte.nom_creador}</td>
                <td>${producte.num_versions}</td>
                <td>${new Date(producte.data_creacio_proj_nk).toLocaleDateString()}</td>
                <td>${producte.notes_producte_proj_nk || ''}</td>
                <td>
                    <button class="button-small" data-action="edit-producte" data-id="${producte.id_proj_nk}">Editar</button>
                    <button class="button-small" data-action="view-versions" data-id="${producte.id_proj_nk}" data-name="${producte.nom_producte_proj_nk}">Versions</button>
                    <button class="button-small button-danger" data-action="delete-producte" data-id="${producte.id_proj_nk}">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="7" class="error-message">Error: ${error.message}</td></tr>`;
    }
}


async function carregarRegistresAuditoria(limit = 25) {
    const tableBody = document.querySelector("#audit-log-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6">Carregant registres...</td></tr>';

    try {
        const response = await fetch(`/api/audit-logs?limit=${limit}`);
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        if (result.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No s\'han trobat registres d\'auditoria.</td></tr>';
            return;
        }

        tableBody.innerHTML = "";
        result.data.forEach(log => {
            const row = document.createElement("tr");
            const dataFormatada = new Date(log.data_accio_nk).toLocaleString('ca-ES');
            row.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${log.nom_admin || 'Sistema'}</td>
                <td>${log.accio_nk}</td>
                <td>${log.taula_objectiu_nk}</td>
                <td>${log.id_objectiu_nk}</td>
                <td><pre>${JSON.stringify(JSON.parse(log.valor_nou_nk || '{}'), null, 2)}</pre></td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error en carregar auditoria:", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="error-message">Error: ${error.message}</td></tr>`;
    }
}

// --- Funcions per a accions de taules (abans globals) ---

async function obrirModalEditarAdmin(id) {
    const modal = document.getElementById('edit-admin-modal');
    try {
        const response = await fetch(`/api/administradors/${id}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        const admin = result.data;
        document.getElementById('edit-admin-id').value = admin.id_admin_nk;
        document.getElementById('edit-nom').value = admin.nom_admin_nk;
        document.getElementById('edit-email').value = admin.email_admin_nk;
        document.getElementById('edit-notes').value = admin.notes_admin_nk;
        modal.style.display = 'flex';
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function eliminarAdmin(id) {
    if (!confirm('Estàs segur que vols eliminar aquest administrador?')) return;
    try {
        const response = await fetch(`/api/administradors/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        alert('Administrador eliminat correctament.');
        carregarTaulaAdmins();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function obrirModalEditarRolGlobal(id) {
    const modal = document.getElementById('edit-rol-global-modal');
    try {
    const response = await fetch(`/api/definicions-rols/${id}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        const rol = result.data;
        document.getElementById('edit-rol-global-id').value = rol.id_rol_def_nk;
        document.getElementById('edit-rol-global-nom').value = rol.nom_rol_def_nk;
        document.getElementById('edit-rol-global-descripcio').value = rol.descripcio_rol_def_nk;
        modal.style.display = 'flex';
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function eliminarRolGlobal(id) {
    if (!confirm('Estàs segur que vols eliminar aquesta definició de rol?')) return;
    try {
    const response = await fetch(`/api/definicions-rols/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        alert('Definició de rol eliminada correctament.');
        carregarTaulaRolsGlobals();
        carregarSelectorsRols();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function obrirModalEditarProducte(id) {
    const modal = document.getElementById('edit-producte-modal');
    try {
        const response = await fetch(`/api/productes/${id}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        const producte = result.data;
        document.getElementById('edit-producte-id').value = producte.id_proj_nk;
        document.getElementById('edit-producte-nom').value = producte.nom_producte_proj_nk;
        document.getElementById('edit-producte-email').value = producte.email_producte_proj_nk;
        document.getElementById('edit-producte-notes').value = producte.notes_producte_proj_nk;
        modal.style.display = 'flex';
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function eliminarProducte(id) {
    if (!confirm('Estàs segur que vols eliminar aquest producte i totes les seves versions?')) return;
    try {
        const response = await fetch(`/api/productes/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        alert('Producte eliminat correctament.');
        carregarTaulaProductes();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function obrirModalVersions(id, name) {
    const modal = document.getElementById('versions-producte-modal');
    const title = document.getElementById('versions-modal-title');
    const tableBody = document.getElementById('versions-list-body');
    
    title.textContent = `Versions de "${name}"`;
    tableBody.innerHTML = '<tr><td colspan="3">Carregant...</td></tr>';
    modal.style.display = 'flex';

    try {
        const response = await fetch(`/api/productes/${id}/versions`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message);

        tableBody.innerHTML = '';
        result.data.forEach(versio => {
            tableBody.innerHTML += `<tr><td>${versio.nom_versio_nk}</td><td>${new Date(versio.data_creacio_versio_nk).toLocaleDateString()}</td><td><button class="button-small" data-action="edit-version" data-id="${versio.id_versio_nk}">Editar</button></td></tr>`;
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="3" class="error-message">Error: ${error.message}</td></tr>`;
    }
}

function initModals() {
    // Tancar modals
    document.querySelectorAll('.modal-close-button').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').style.display = 'none';
        });
    });

    initApiFormHandler('form-edit-admin', '', {
        method: 'PUT',
        onSuccess: (result, form) => {
            document.getElementById('edit-admin-modal').style.display = 'none';
            carregarTaulaAdmins();
        },
        prepareData: (formData, data) => {
            const form = document.getElementById('form-edit-admin');
            const id = document.getElementById('edit-admin-id').value;
            form.action = `/api/administradors/${id}`;
            return data;
        }
    });

    initApiFormHandler('form-edit-rol-global', '', {
        method: 'PUT',
        onSuccess: (result, form) => {
            document.getElementById('edit-rol-global-modal').style.display = 'none';
            carregarTaulaRolsGlobals();
            carregarSelectorsRols();
        },
        prepareData: (formData, data) => {
            const form = document.getElementById('form-edit-rol-global');
            const id = document.getElementById('edit-rol-global-id').value;
            form.action = `/api/definicions-rols/${id}`;
            return data;
        }
    });
    
    initApiFormHandler('form-edit-producte', '', {
        method: 'PUT',
        onSuccess: (result, form) => {
            document.getElementById('edit-producte-modal').style.display = 'none';
            carregarTaulaProductes();
        },
        prepareData: (formData, data) => {
            const form = document.getElementById('form-edit-producte');
            const id = document.getElementById('edit-producte-id').value;
            form.action = `/api/productes/${id}`;
            return data;
        }
    });
}

function initTableActionListeners() {
    const mainContent = document.querySelector('.dashboard-main');
    if (!mainContent) return;

    mainContent.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const action = button.dataset.action;
        const id = button.dataset.id;
        const name = button.dataset.name;

        switch (action) {
            case 'edit-admin': obrirModalEditarAdmin(id); break;
            case 'delete-admin': eliminarAdmin(id); break;
            case 'edit-rol-global': obrirModalEditarRolGlobal(id); break;
            case 'delete-rol-global': eliminarRolGlobal(id); break;
            case 'edit-producte': obrirModalEditarProducte(id); break;
            case 'delete-producte': eliminarProducte(id); break;
            case 'view-versions': obrirModalVersions(id, name); break;
            // case 'edit-version': obrirModalEditarVersio(id); break; // A implementar
        }
    });
}

export async function adminPage() {
    console.log("Iniciando adminPage...");
    
    try {
        // Inicializar componentes en orden
        await initAdminHeroAnimation();
        console.log("Hero animation initialized");
        
        await initAdminTabs();
        console.log("Admin tabs initialized");
        
        // Cargar datos necesarios
        await Promise.all([
            carregarSelectorsAdmin().then(() => console.log("Admin selectors loaded")),
            carregarSelectorsRols().then(() => console.log("Roles selectors loaded")),
            carregarTaulaAdmins().then(() => console.log("Admin table loaded")),
            carregarTaulaRolsGlobals().then(() => console.log("Roles table loaded"))
        ]);

        // Inicializar formularios
        initNouAdminForm();
        console.log("New admin form initialized");

        // Inicializar listeners de la tabla
        initTableActionListeners();
        console.log("Table action listeners initialized");

        // Inicializar autenticación y logout handler
        try {
            await initAdminAuth();
            const logoutBtn = document.getElementById('logout-button');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    try {
                        await adminLogout();
                    } catch (err) {
                        console.error('Error al cerrar sesión:', err);
                        alert('Error al cerrar sesión');
                    }
                });
            }
        } catch (err) {
            console.warn('No s\'ha pogut inicialitzar la autenticació:', err);
        }

        // Hacer visible la primera sección por defecto si existe
        const firstSection = document.querySelector('.form-section-card, .audit-section-card');
        if (firstSection) {
            firstSection.classList.add('active');
            console.log("First section activated");
        }

        console.log("Admin page initialization completed successfully");
    } catch (error) {
        console.error("Error in adminPage initialization:", error);
        // Mostrar mensaje de error al usuario
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Error al cargar la página. Por favor, recarga la página o contacta con soporte.';
            mainContent.prepend(errorDiv);
        }
    }
}
