// CLIENT/COM_HTML/SCRIPT.js

// Importa els mòduls que necessitis al principi de tot
import { auth } from './firebase-init.js';
import { signInWithEmailAndPassword } from "firebase/auth";
import './BACKGROUND.js'; // Importem el fons animat perquè s'executi

// La resta del teu codi va dins de l'event listener
document.addEventListener('DOMContentLoaded', () => {
    // ... aquí anirà la lògica de cada pàgina, com ja tenies ...
    // Per exemple, el codi per a la pàgina de login:
    if (document.body.classList.contains('page-login')) {
        // El teu codi de login amb `signInWithEmailAndPassword` aniria aquí
    }
});


document.addEventListener('DOMContentLoaded', () => {

    // --- LÒGICA DEL FORMULARI ADMIN (Admin.html) ---
    if (document.body.classList.contains('page-admin')) {
        const outputDiv = document.getElementById('output');
        const adminForm = document.getElementById('adminForm');
        const userListEl = document.getElementById('userList');
        const searchInput = document.getElementById('searchInput');
        const btnRegistrar = document.getElementById('btnRegistrar');
        const btnModificar = document.getElementById('btnModificar');
        const dadesRegistreFs = document.getElementById('dadesRegistre');
        const spinner = document.getElementById('spinner-overlay');
        const reportModal = document.getElementById('reportModal');
        const btnResum = document.getElementById('btnResum');
        const closeModalBtn = document.querySelector('.close-button');
        const reportContent = document.getElementById('reportContent');
        let allUsers = [];

        async function callApi(payload) {
            spinner.style.display = 'flex';
            outputDiv.style.display = 'none';
            try {
                const response = await fetch(URL_API_SCRIPT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error(`Error de xarxa: ${response.statusText}`);
                const result = await response.json();
                if (result.status === 'error') throw new Error(result.message);
                return result.data || result;
            } catch (error) {
                showOutput(`Error: ${error.message}`, 'error');
                throw error;
            } finally {
                spinner.style.display = 'none';
            }
        }

        async function loadInitialData() {
            try {
                const data = await callApi({ action: 'getNewUsers' });
                allUsers = data || [];
                renderUserList(allUsers);
                showOutput(`S'han carregat ${allUsers.length} usuaris pendents.`, 'success');
            } catch (error) { /* L'error ja es mostra a callApi */ }
        }

        function renderUserList(users) {
            userListEl.innerHTML = '';
            if (!users || users.length === 0) {
                userListEl.innerHTML = '<li class="user-list-item">No hi ha usuaris pendents.</li>';
                return;
            }
            users.forEach(user => {
                const li = document.createElement('li');
                li.className = 'user-list-item';
                li.dataset.userId = user.id;
                li.innerHTML = `${user.nom} ${user.cognoms} <span>${user.email}</span>`;
                li.onclick = () => selectUser(user.id);
                userListEl.appendChild(li);
            });
        }

        function selectUser(userId) {
            document.querySelectorAll('.user-list-item').forEach(item => item.classList.remove('selected'));
            const selectedUser = allUsers.find(u => u.id == userId);
            if (!selectedUser) return;
            document.querySelector(`.user-list-item[data-user-id="${userId}"]`).classList.add('selected');
            for (const key in selectedUser) {
                const element = document.getElementById(key);
                if (element) {
                    element.value = selectedUser[key];
                }
            }
            dadesRegistreFs.disabled = false;
            btnRegistrar.disabled = false;
            btnModificar.disabled = false;
            outputDiv.style.display = 'none';
        }

        window.resetForm = function() {
            adminForm.reset();
            ['id', 'fila'].forEach(id => document.getElementById(id).value = '');
            dadesRegistreFs.disabled = true;
            btnRegistrar.disabled = true;
            btnModificar.disabled = true;
            document.querySelectorAll('.user-list-item').forEach(item => item.classList.remove('selected'));
            outputDiv.style.display = 'none';
        }

        function showOutput(message, type) {
            outputDiv.textContent = message;
            outputDiv.className = type;
            outputDiv.style.display = 'block';
        }

        function getFormData() {
            const data = {};
            const formElements = adminForm.elements;
            ['id', 'fila', 'email', 'nom', 'cognoms', 'dni', 'telèfon', 'adreca', 'poblacio', 'pais', 'codiPostal', 'dataSolicitud', 'dataCobrament', 'metodeCobrament', 'quantitatPagada'].forEach(id => {
                if (formElements[id]) data[id] = formElements[id].value;
            });
            data.cobrat = formElements['cobratCheckbox'] ? formElements['cobratCheckbox'].checked : false;
            return data;
        }

        loadInitialData();
        searchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredUsers = allUsers.filter(user => user.nom.toLowerCase().includes(searchTerm) || user.cognoms.toLowerCase().includes(searchTerm));
            renderUserList(filteredUsers);
        });

        btnModificar.addEventListener('click', async () => {
            if (!document.getElementById('id').value) {
                showOutput('Selecciona un usuari per modificar.', 'error');
                return;
            }
            try {
                const result = await callApi({ action: 'updateNewUser', dades: getFormData() });
                showOutput(result.message, 'success');
                resetForm();
                loadInitialData();
            } catch (error) { /* Error ja gestionat */ }
        });

        btnResum.addEventListener('click', async () => {
            try {
                const summaryData = await callApi({ action: 'getUsersSummary' });
                let tableHtml = `<p><b>Total d'usuaris pendents: ${summaryData.total}</b></p>`;
                if (summaryData.total > 0) {
                    tableHtml += `<table id="report-table"><thead><tr><th>ID</th><th>Nom Complet</th><th>Email</th><th>Data Sol·licitud</th></tr></thead><tbody>${summaryData.users.map(user => `<tr><td>${user.id}</td><td>${user.nom} ${user.cognoms}</td><td>${user.email}</td><td>${user.dataSolicitud}</td></tr>`).join('')}</tbody></table>`;
                }
                reportContent.innerHTML = tableHtml;
                reportModal.style.display = 'block';
            } catch (error) { /* L'error ja es mostra a callApi */ }
        });

        closeModalBtn.onclick = () => { reportModal.style.display = 'none'; };
        window.onclick = (event) => { if (event.target == reportModal) { reportModal.style.display = 'none'; } };

        btnRegistrar.addEventListener('click', async () => {
            const dades = getFormData();
            if (!dades.id) {
                showOutput('Selecciona un usuari per registrar.', 'error');
                return;
            }
            if (!dades.telèfon || !dades.dataCobrament || !dades.metodeCobrament || !dades.quantitatPagada) {
                showOutput('Completa tots els camps de Registre i Pagament.', 'error');
                return;
            }
            try {
                const result = await callApi({ action: 'registerNewUser', dades: dades });
                showOutput(result.message, 'success');
                resetForm();
                loadInitialData();
            } catch (error) { /* Error ja gestionat */ }
        });
    }

    // --- LÒGICA DEL FORMULARI NOU USUARI (Newuser.html) ---
    if (document.body.classList.contains('page-newuser')) {
        const initialView = document.getElementById('initial-view');
        const btnMostrarFormulari = document.getElementById('btnMostrarFormulari');
        const form = document.getElementById('registrationForm');
        const outputDiv = document.getElementById('output');
        const submitButton = document.getElementById('btnSubmit');
        btnMostrarFormulari.addEventListener('click', () => { initialView.style.display = 'none'; form.style.display = 'block'; outputDiv.style.display = 'none'; });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email');
            const email = emailInput.value.trim();
            if (email === '' || !email.toLowerCase().endsWith('@gmail.com')) {
                alert("Si us plau, utilitza una adreça de correu de Google (acabada en @gmail.com).");
                emailInput.focus();
                return;
            }
            submitButton.disabled = true;
            submitButton.textContent = 'Enviant...';
            outputDiv.className = '';
            outputDiv.style.display = 'none';
            try {
                const formData = { email: email, nom: document.getElementById('nom').value, cognoms: document.getElementById('cognoms').value, dni: document.getElementById('dni').value, adreca: document.getElementById('adreca').value, telèfon: document.getElementById('telèfon').value, poblacio: document.getElementById('poblacio').value, pais: document.getElementById('pais').value, codiPostal: document.getElementById('codiPostal').value, comentaris: document.getElementById('comentaris').value };
                const formResponse = await fetch(URL_API_SCRIPT, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(formData) });
                const result = await formResponse.json();
                if (result.status === 'ok' && result.data && result.data.status === 'success') {
                    outputDiv.className = 'success';
                    outputDiv.textContent = result.data.message;
                    form.style.display = 'none';
                    initialView.style.display = 'block';
                    form.reset();
                } else {
                    throw new Error(result.message || 'Ha ocorregut un error desconegut.');
                }
            } catch (error) {
                outputDiv.className = 'error';
                outputDiv.textContent = "Error: " + error.message;
            } finally {
                outputDiv.style.display = 'block';
                submitButton.disabled = false;
                submitButton.textContent = "Envia la Inscripció";
            }
        });
    }

    // --- LÒGICA DEL MODAL DE CLIENTS (AF_CLIENTS.html) ---
    if (document.body.classList.contains('page-clients')) { // O la clase que le corresponda a AF_CLIENTS.html
        const openModalBtn = document.getElementById('open-client-form-btn');
        const closeModalBtn = document.getElementById('close-client-modal-btn');
        const modal = document.getElementById('client-modal');
        const clientForm = document.getElementById('add-client-form');

        function showClientModal() {
            if(modal) modal.style.display = 'flex';
        }

        function hideClientModal() {
            if(modal) modal.style.display = 'none';
        }

        if(openModalBtn) openModalBtn.addEventListener('click', showClientModal);
        if(closeModalBtn) closeModalBtn.addEventListener('click', hideClientModal);

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                hideClientModal();
            }
        });

        if(clientForm) {
            clientForm.addEventListener('submit', (event) => {
                event.preventDefault(); 

                const submitButton = clientForm.querySelector('.btn-submit');
                submitButton.disabled = true;
                submitButton.textContent = 'Guardant...';

                const clientData = {
                    nom: clientForm.nom.value,
                    cognoms: clientForm.cognoms.value,
                    dni: clientForm.dni.value,
                    email: clientForm.email.value,
                    adreca: clientForm.adreca.value,
                    ciutat: clientForm.ciutat.value,
                    pais: clientForm.pais.value,
                    codi_postal: clientForm.codi_postal.value,
                    telefon: clientForm.telefon.value
                };

                google.script.run
                    .withSuccessHandler(onClientAddedSuccess)
                    .withFailureHandler(onClientAddedFailure)
                    .addClient(clientData);
            });
        }
    }
});


// --- Funcions de Callback i Notificacions (poden anar fora si són globals) ---

function onClientAddedSuccess(response) {
    showNotification(response, 'success');
    const clientForm = document.getElementById('add-client-form');
    if(clientForm) {
        clientForm.reset();
        const submitButton = clientForm.querySelector('.btn-submit');
        submitButton.disabled = false;
        submitButton.textContent = 'Guardar Client';
    }
    const modal = document.getElementById('client-modal');
    if(modal) modal.style.display = 'none'; // Amaga el modal
}

function onClientAddedFailure(error) {
    showNotification('Error: ' + error.message, 'error');
    const clientForm = document.getElementById('add-client-form');
    if(clientForm) {
       const submitButton = clientForm.querySelector('.btn-submit');
        submitButton.disabled = false;
        submitButton.textContent = 'Guardar Client';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 5000);
}