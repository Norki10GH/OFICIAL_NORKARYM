// NORKÄRŸM - PUNT D'ENTRADA PRINCIPAL DEL FRONTEND (main.js)

// Importacions globals que s'executen en totes les pàgines
import '/src/js/components/particle-animation.js'; // Animació de fons de partícules

// Mòduls de Firebase necessaris per a les seccions específiques
import { getAuth, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {

    // --- CARREGADOR DINÀMIC DE RECURSOS ---
    // Aquesta secció carrega el CSS específic per a cada pàgina basant-se 
    // en la classe del <body> (ex: <body class="page-inici"> carrega inici.css)
    const pageClass = Array.from(document.body.classList).find(cls => cls.startsWith('page-'));
    if (pageClass) {
        const pageName = pageClass.replace('page-', '');
        
        // Injecta dinàmicament el fitxer CSS corresponent al <head>
        const cssPath = `/src/css/pages/${pageName}.css`;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        document.head.appendChild(link);
    }
    
    // --- LÒGICA ESPECÍFICA PER PÀGINA ---

    // --- Pàgina d'Inici (index.html) ---
    if (document.body.classList.contains('page-inici')) {
        // No hi ha lògica específica per a la pàgina d'inici.
        // L'animació de partícules ja es carrega globalment.
        // Els enllaços són HTML estàndard.
    }

    // --- Pàgina de Login (Login.html) ---
    if (document.body.classList.contains('page-login')) {
        const auth = getAuth();
        const emailForm = document.getElementById('email-form');
        const passwordForm = document.getElementById('password-form');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const statusDiv = document.getElementById('status-message');

        // Gestionar el formulari de l'email
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value;
            statusDiv.innerHTML = 'Verificant...';
            statusDiv.className = '';

            try {
                const methods = await fetchSignInMethodsForEmail(auth, email);
                if (methods.length > 0) {
                    emailForm.classList.add('hidden');
                    passwordForm.classList.remove('hidden');
                    emailInput.disabled = true;
                    passwordInput.focus();
                } else {
                    statusDiv.className = 'error';
                    statusDiv.textContent = 'Email no trobat. Contacta amb l\'administrador.';
                }
            } catch (error) {
                statusDiv.className = 'error';
                statusDiv.textContent = 'Error: ' + error.message;
            }
        });

        // Gestionar el formulari de la contrasenya
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;
            statusDiv.innerHTML = 'Processant...';

            try {
                await signInWithEmailAndPassword(auth, email, password);
                // En cas d'èxit, Firebase redirigeix a la pàgina d'administració
                window.location.href = '/src/pages/admin.html'; 
            } catch (error) {
                statusDiv.className = 'error';
                if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    statusDiv.textContent = 'La contrasenya és incorrecta.';
                } else {
                    statusDiv.textContent = 'Error: ' + error.message;
                }
            }
        });
    }

    // --- Pàgina d'Administració (Admin.html) ---
    if (document.body.classList.contains('page-admin')) {
        // ... (Aquí aniria tota la lògica de la pàgina d'admin, que es manté igual)
    }

    // --- Pàgina de Nou Usuari (Newuser.html) ---
    if (document.body.classList.contains('page-newuser')) {
        // ... (Aquí aniria tota la lògica de la pàgina de nou usuari, que es manté igual)
    }

    // --- Pàgina de Clients (AF_CLIENTS.html) ---
    if (document.body.classList.contains('page-clients')) {
        // ... (Aquí aniria tota la lògica de la pàgina de clients, que es manté igual)
    }
});

// --- Funcions de Callback i Notificacions Globals ---
// (Les funcions com onClientAddedSuccess, showNotification, etc., es mantenen aquí)
