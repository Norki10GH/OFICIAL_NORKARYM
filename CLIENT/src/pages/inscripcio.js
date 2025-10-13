// CLIENT/src/js/pages/inscripcio.js

export function inscripcioPage() {
  const form = document.getElementById('registrationForm');
  const outputDiv = document.getElementById('output');
  const submitButton = document.getElementById('btnSubmit');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitButton.disabled = true;
      submitButton.textContent = 'Enviant...';
      outputDiv.style.display = 'none';

      // Recopilem les dades del formulari
      const formData = new FormData(form);
      const dades = Object.fromEntries(formData.entries());

      try {
        // Fem la crida a la nostra API del backend
        const response = await fetch('/api/registerNewUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dades }), // Enviem les dades dins d'un objecte 'dades'
        });

        const result = await response.json();

        if (result.status === 'ok') {
          outputDiv.className = 'success';
          outputDiv.textContent = 'Inscripció enviada correctament! Aviat rebràs notícies.';
          form.reset();
        } else {
          throw new Error(result.message || 'Error desconegut del servidor.');
        }

      } catch (error) {
        outputDiv.className = 'error';
        outputDiv.textContent = `Error: ${error.message}`;
      } finally {
        outputDiv.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = "Envia la Inscripció";
      }
    });
  }
}