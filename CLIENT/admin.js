import { API_BASE_URL } from './config/apiConfig.js';

/**
 * Inicialitza la funcionalitat específica de la pàgina d'administració.
 */
export function adminPage() {
    console.log("Mòdul admin.js carregat.");
    initAdminRegistrationForm();
    initAdminNavigation(); // Afegeix aquesta línia
}

/**
 * Configura la navegació de la barra lateral per mostrar/ocultar seccions.
 */
function initAdminNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const sections = document.querySelectorAll('.dashboard-main section');
    const welcomeImage = document.querySelector('.admin-section-image');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Amaga totes les seccions i la imatge de benvinguda
            sections.forEach(section => {
                section.style.display = 'none';
            });
            if (welcomeImage) {
                welcomeImage.style.display = 'none';
            }

            // Mostra la secció corresponent
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
}


/**
 * Configura la validació i usabilitat del formulari de registre de nous administradors.
 */
function initAdminRegistrationForm() {
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

    // Funció per validar la coincidència de contrasenyes
    const validatePasswords = () => {
        if (passwordInput.value && confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordError.style.display = 'block';
            confirmPasswordInput.setCustomValidity('Les contrasenyes no coincideixen.');
        } else {
            confirmPasswordError.style.display = 'none';
            confirmPasswordInput.setCustomValidity('');
        }
    };

    // Funció per comprovar la força de la contrasenya
    const checkPasswordStrength = () => {
        const pass = passwordInput.value;
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[a-z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        let width = (score / 5) * 100;
        let color = 'var(--color-accent-danger)'; // Feble
        let text = 'Feble';
        if (score >= 3) {
            color = 'orange'; // Mitjana
            text = 'Mitjana';
        }
        if (score >= 4) {
            color = 'var(--color-accent-success)'; // Forta
            text = 'Forta';
        }
        
        strengthMeter.style.width = `${width}%`;
        strengthMeter.style.backgroundColor = color;
        
        if (pass.length > 0) {
            strengthText.textContent = `Força: ${text}`;
            strengthText.style.display = 'block';
            strengthText.style.color = color;
        } else {
            strengthText.style.display = 'none';
            strengthMeter.style.width = '0%';
        }
    };

    passwordInput.addEventListener('input', checkPasswordStrength);
    passwordInput.addEventListener('input', validatePasswords);
    confirmPasswordInput.addEventListener('input', validatePasswords);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        validatePasswords();
        if (!form.checkValidity()) {
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE_URL}/registrarAdmin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                alert('Administrador registrat amb èxit!');
                form.reset();
            } else {
                const error = await response.json();
                alert(`Error al registrar l'administrador: ${error.message}`);
            }
        } catch (error) {
            console.error('Error de xarxa:', error);
            alert('Error de connexió. Si us plau, intenta-ho de nou més tard.');
        }
    });
}
