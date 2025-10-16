// CLIENT/src/js/components/adminForms.js

// Importem la instància d'autenticació ja inicialitzada
import { auth } from "../../config/firebase-init.js";

export function createAddAdminForm(container, onCancel, onSuccess) {
  container.innerHTML = "";
  const formContainer = document.createElement("div");
  formContainer.id = "add-admin-view";

  const title = document.createElement("h2");
  title.textContent = "Afegir Nou Administrador";
  formContainer.appendChild(title);

  const form = document.createElement("form");
  form.id = "add-admin-form";
  form.innerHTML = `
    <div class="form-grid">
      <input type="text" id="nom" name="nom" placeholder="Nom de l'administrador" required>
      <input type="email" id="email" name="email" placeholder="Email de l'administrador" required>
      <textarea id="notes" name="notes" placeholder="Notes (opcional)"></textarea>
    </div>
    <div class="button-group">
      <button type="button" id="btn-cancel-add-admin" class="button-secondary">Cancel·lar</button>
      <button type="submit" id="btn-submit-admin" class="button-primary">Desar Administrador</button>
    </div>
  `;
  formContainer.appendChild(form);
  
  const outputDiv = document.createElement("div");
  outputDiv.id = "admin-output";
  outputDiv.style.display = "none";
  formContainer.appendChild(outputDiv);

  container.appendChild(formContainer);

  const btnSubmit = form.querySelector("#btn-submit-admin");
  const btnCancel = form.querySelector("#btn-cancel-add-admin");

  btnCancel.addEventListener("click", onCancel);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviant...";
    outputDiv.style.display = "none";
    
    // Ara fem servir la instància 'auth' importada
    const currentUser = auth.currentUser;

    if (!currentUser) {
      outputDiv.className = "error";
      outputDiv.textContent = "Error: Has d'estar autenticat per a realitzar aquesta acció.";
      outputDiv.style.display = "block";
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Desar Administrador";
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.firebase_uid = currentUser.uid; // El backend necessita saber qui fa la petició

    try {
      const response = await fetch("/api/addAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        outputDiv.className = "success";
        outputDiv.textContent = "Administrador afegit correctament!";
        form.reset();
        setTimeout(onSuccess, 2000);
      } else {
        throw new Error(result.message || "Hi ha hagut un error desconegut.");
      }
    } catch (error) {
      outputDiv.className = "error";
      outputDiv.textContent = `Error: ${error.message}`;
    } finally {
      outputDiv.style.display = "block";
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Desar Administrador";
    }
  });
}
