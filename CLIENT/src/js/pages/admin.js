// client/src/js/pages/admin.js

/**
 * Gestiona el scroll suau des dels enllaços.
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Actualitza l'enllaç actiu a la barra lateral segons la posició de l'scroll.
 */
function initAdminNavigationObserver() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const sections = document.querySelectorAll('.form-section-card, .audit-section-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-40% 0px -60% 0px' }); // Activa quan la secció està al mig

    sections.forEach(section => observer.observe(section));
}

// ... (Les funcions initAdminForm, initRoleAssignmentForm, etc., no canvien)
// ... (Pega aquí les teves funcions `initAdminForm`, `initRoleAssignmentForm` i `initAuditLogViewer` de la meva resposta anterior)

/**
 * Funció principal que s'exporta i s'executa a main.js
 */
export function adminPage() {
    // La hero animation ja no és necessària aquí si la recuperes del inici.js
    // initHeroAnimation(); 
    initSmoothScroll();
    initAdminNavigationObserver();
    initAdminForm();
    initRoleAssignmentForm();
    initAuditLogViewer();
}

// Funcions auxiliars que ja tenies (les copio per si de cas)
function showResult(element, message, type) {
    element.textContent = message;
    element.className = `form-resultat ${type}`;
    element.style.display = 'block';
}

async function initRoleAssignmentForm() {
    const form = document.getElementById('form-assignar-rol');
    const resultatDiv = document.getElementById('form-resultat-assignar-rol');
    const adminSelect = document.getElementById('admin-select');

    if (!form || !adminSelect) return;

    // 1. Carregar administradors al desplegable
    try {
        const response = await fetch('/api/administradors');
        const result = await response.json();
        if (!result.success) throw new Error(result.message);

        adminSelect.innerHTML = '<option value="">-- Selecciona un administrador --</option>';
        result.data.forEach(admin => {
            const option = document.createElement('option');
            option.value = admin.firebase_uid_admin_nk;
            option.textContent = `${admin.nom_admin_nk} (${admin.email_admin_nk})`;
            adminSelect.appendChild(option);
        });
    } catch (error) {
        adminSelect.innerHTML = `<option value="">Error en carregar administradors</option>`;
        console.error(error);
    }
    //... (La resta de la funció es manté igual)
     form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Assignant...';
        resultatDiv.textContent = '';
        resultatDiv.style.display = 'none';

        const data = Object.fromEntries(new FormData(form).entries());

        try {
            const response = await fetch('/api/assignarRol', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            showResult(resultatDiv, result.message, 'success');
            form.reset();
        } catch (error) {
            showResult(resultatDiv, error.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Assignar Rol';
        }
    });
}
function initAdminForm() {
    const form = document.getElementById('form-nou-admin');
    const resultatDiv = document.getElementById('form-resultat-nou-admin');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Registrant...';
        resultatDiv.textContent = '';
        resultatDiv.style.display = 'none';

        const data = Object.fromEntries(new FormData(form).entries());

        if (data.password !== data.confirmPassword) {
            showResult(resultatDiv, 'Error: Les contrasenyes no coincideixen.', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Registrar Administrador';
            return;
        }

        const dataToSend = { nom: data.nom, email: data.email, password: data.password, notes: data.notes };

        try {
            const response = await fetch('/api/registrarAdmin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            showResult(resultatDiv, result.message, 'success');
            form.reset();
        } catch (error) {
            showResult(resultatDiv, error.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Registrar Administrador';
        }
    });
}
function initAuditLogViewer() {
    const auditSection = document.getElementById('section-auditoria');
    const tableBody = document.querySelector('#audit-log-table tbody');

    if (!auditSection || !tableBody) return;
    
    // Utilitzem un IntersectionObserver per carregar les dades només quan la secció és visible
    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            observer.unobserve(auditSection); // Deixem d'observar un cop carregat
            
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Carregant registres...</td></tr>';
            try {
                const response = await fetch('/api/audit-logs');
                const result = await response.json();
                if (!result.success || !Array.isArray(result.data)) throw new Error('No es van poder carregar els registres.');

                if (result.data.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hi ha registres.</td></tr>';
                    return;
                }

                const rows = result.data.map(log => {
                    const data = new Date(log.data_accio_nk).toLocaleString('ca-ES');
                    const valorNou = log.valor_nou_nk ? `<pre>${JSON.stringify(JSON.parse(log.valor_nou_nk), null, 2)}</pre>` : '';
                    return `
                        <tr>
                            <td>${data}</td>
                            <td>${log.id_admin_nk || 'Sistema'}</td>
                            <td>${log.accio_nk}</td>
                            <td>${log.taula_objectiu_nk}</td>
                            <td>${log.id_objectiu_nk}</td>
                            <td>${valorNou}</td>
                        </tr>
                    `;
                }).join('');
                tableBody.innerHTML = rows;
            } catch (error) {
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">${error.message}</td></tr>`;
            }
        }
    }, { threshold: 0.1 });

    observer.observe(auditSection);
}