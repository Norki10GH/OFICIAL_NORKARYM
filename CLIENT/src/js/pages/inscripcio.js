// CLIENT/src/js/pages/inscripcio.js

export function inscripcioPage() {
    const initialView = document.getElementById('initial-view');
    const registrationForm = document.getElementById('registrationForm');
    const btnMostrarFormulari = document.getElementById('btnMostrarFormulari');
    const outputDiv = document.getElementById('output');
    const btnSubmit = document.getElementById('btnSubmit');

    // Mostra el formulari en clicar el botó d'inscripcions
    if (btnMostrarFormulari) {
        btnMostrarFormulari.addEventListener('click', () => {
            initialView.style.display = 'none';
            registrationForm.style.display = 'block';
        });
    }

    // Lògica per a l'enviament del formulari
    if (registrationForm) {
        registrationForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Enviant...";
            outputDiv.style.display = "none";

            const formData = new FormData(registrationForm);
            const data = Object.fromEntries(formData.entries());

            try {
                // Utilitzem l'endpoint que ja tenies configurat a firebase.json
                const response = await fetch("/api/registerNewUser", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ dades: data }),
                });

                const result = await response.json();

                if (result.status === "ok") {
                    outputDiv.className = "success";
                    outputDiv.textContent = "Inscripció enviada correctament! Aviat rebràs notícies.";
                    registrationForm.reset();
                    // Opcional: tornar a la vista inicial després d'uns segons
                    setTimeout(() => {
                        registrationForm.style.display = 'none';
                        initialView.style.display = 'block';
                        outputDiv.style.display = 'none';
                    }, 3000);
                } else {
                    throw new Error(result.message || "Error desconegut del servidor.");
                }
            } catch (error) {
                outputDiv.className = "error";
                outputDiv.textContent = `Error: ${error.message}`;
            } finally {
                outputDiv.style.display = "block";
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Envia la Inscripció";
            }
        });
    }
}