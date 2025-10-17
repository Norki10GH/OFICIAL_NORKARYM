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
    if (selectors.length === 0) return;

    try {
        const response = await fetch('/api/administradors');
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
        console.error("Error en carregar administradors:", error);
        selectors.forEach(select => {
            select.innerHTML = `<option value="">${error.message}</option>`;
            select.disabled = true;
        });
    }
}

async function carregarSelectorsRols() {
    const selector = document.getElementById('rol-nivell');
    if (!selector) return;

    try {
        const response = await fetch('/api/rols-definició');
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
    if (!form) return;

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
    initApiFormHandler('form-nou-admin', '/api/registrar', {
        onSuccess: (result) => {
            document.getElementById('form-nou-admin').reset();
            carregarTaulaAdmins();
            carregarSelectorsAdmin();
        }
    });

    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    const confirmPasswordError = document.getElementById('confirm-password-error');

    if (password && confirmPassword && confirmPasswordError) {
        const validatePasswords = () => {
            if (password.value !== confirmPassword.value) {
                confirmPasswordError.style.display = 'block';
            } else {
                confirmPasswordError.style.display = 'none';
            }
        };
        password.addEventListener('input', validatePasswords);
        confirmPassword.addEventListener('input', validatePasswords);
    }
}

function initCrearRolGlobalForm() {
    initApiFormHandler('form-crear-rol-global', '/api/rols-definició', {
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
    const sections = document.querySelectorAll('.dashboard-main > section');
    const imagePlaceholder = document.querySelector('.admin-section-image');

    const showSection = (targetId) => {
        let sectionVisible = false;
        sections.forEach(section => {
            if (section.id === targetId) {
                section.style.display = 'block';
                sectionVisible = true;
            } else {
                section.style.display = 'none';
            }
        });
        if (imagePlaceholder) {
            imagePlaceholder.style.display = sectionVisible ? 'none' : 'block';
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
            
            showSection(targetId);
            window.location.hash = link.getAttribute('href');
        });
    });

    const hash = window.location.hash;
    if (hash) {
        const link = document.querySelector(`.sidebar-nav .nav-link[href="${hash}"]`);
        if (link) {
            link.click();
        }
    } else {
        showSection(null);
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
                    <button class="button-small" onclick="obrirModalEditarAdmin(${admin.id_admin_nk})">Editar</button>
                    <button class="button-small button-danger" onclick="eliminarAdmin(${admin.id_admin_nk})">Eliminar</button>
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
        const response = await fetch('/api/rols-definició');
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        tableBody.innerHTML = "";
        result.data.forEach(rol => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${rol.nom_rol_def_nk}</td>
                <td>${rol.descripcio_rol_def_nk || ''}</td>
                <td>
                    <button class="button-small" onclick="obrirModalEditarRolGlobal(${rol.id_rol_def_nk})">Editar</button>
                    <button class="button-small button-danger" onclick="eliminarRolGlobal(${rol.id_rol_def_nk})">Eliminar</button>
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
                    <button class="button-small" onclick="obrirModalEditarProducte(${producte.id_proj_nk})">Editar</button>
                    <button class="button-small" onclick="obrirModalVersions(${producte.id_proj_nk})">Versions</button>
                    <button class="button-small button-danger" onclick="eliminarProducte(${producte.id_proj_nk})">Eliminar</button>
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


function initModals() {
    // Tancar modals
    document.querySelectorAll('.modal-close-button').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').style.display = 'none';
        });
    });

    initApiFormHandler('form-edit-admin', '', {
        method: 'PUT',
        onSuccess: () => {
            document.getElementById('edit-admin-modal').style.display = 'none';
            carregarTaulaAdmins();
        },
        prepareData: (formData, data) => {
            const id = document.getElementById('edit-admin-id').value;
            form.action = `/api/administradors/${id}`;
            return data;
        }
    });

    initApiFormHandler('form-edit-rol-global', '', {
        method: 'PUT',
        onSuccess: () => {
            document.getElementById('edit-rol-global-modal').style.display = 'none';
            carregarTaulaRolsGlobals();
            carregarSelectorsRols();
        },
        prepareData: (formData, data) => {
            const id = document.getElementById('edit-rol-global-id').value;
            form.action = `/api/rols-definició/${id}`;
            return data;
        }
    });
    
    initApiFormHandler('form-edit-producte', '', {
        method: 'PUT',
        onSuccess: () => {
            document.getElementById('edit-producte-modal').style.display = 'none';
            carregarTaulaProductes();
        },
        prepareData: (formData, data) => {
            const id = document.getElementById('edit-producte-id').value;
            form.action = `/api/productes/${id}`;
            return data;
        }
    });
}

// Funcions globals per als botons de les taules
window.obrirModalEditarAdmin = async (id) => {
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
};

window.eliminarAdmin = async (id) => {
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
};

window.obrirModalEditarRolGlobal = async (id) => {
    const modal = document.getElementById('edit-rol-global-modal');
    try {
        const response = await fetch(`/api/rols-definició/${id}`);
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
};

window.eliminarRolGlobal = async (id) => {
    if (!confirm('Estàs segur que vols eliminar aquesta definició de rol?')) return;
    try {
        const response = await fetch(`/api/rols-definició/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        alert('Definició de rol eliminada correctament.');
        carregarTaulaRolsGlobals();
        carregarSelectorsRols();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
};

window.obrirModalEditarProducte = async (id) => {
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
};

window.eliminarProducte = async (id) => {
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
};

export function adminPage() {
    initAdminHeroAnimation();
    initAdminTabs();

    // Càrregues inicials de dades
    carregarSelectorsAdmin();
    carregarSelectorsRols();

    // Càrregues de les taules
    carregarTaulaAdmins();
    carregarTaulaRolsGlobals();
    carregarTaulaProductes();
    carregarRegistresAuditoria();

    // Inicialització de formularis
    initNouAdminForm();
    initCrearRolGlobalForm();
    initAssignarRolForm();
    initAssignarEmailForm();
    initRegistrarProducteForm();
    initAssignarProducteForm();
    
    // Modals
    initModals();
}
