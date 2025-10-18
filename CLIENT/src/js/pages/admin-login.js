import { initAdminAuth, adminLogin } from '../auth/adminAuth.js';

export async function adminLoginPage() {
    // Inicializar autenticación
    try {
        await initAdminAuth();
    } catch (err) {
        console.warn('Error inicializando auth en admin-login:', err);
    }

    const form = document.getElementById('admin-login-form');
    const errorDiv = document.getElementById('login-error');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.email.value;
            const password = form.password.value;

            try {
                const result = await adminLogin(email, password);
                if (!result || !result.success) {
                    errorDiv.textContent = result?.message || 'Error en el inicio de sesión';
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                errorDiv.textContent = 'Error en el inicio de sessió';
                errorDiv.style.display = 'block';
            }
        });
    }

    // Toggle de contraseña
    const toggleBtn = document.querySelector('.password-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    e.target.textContent = '🙈';
                } else {
                    input.type = 'password';
                    e.target.textContent = '👁️';
                }
            }
        });
    }
}

export default adminLoginPage;
