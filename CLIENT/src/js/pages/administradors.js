// CLIENT/src/js/pages/administradors.js

// Importem funcions d'autenticació per obtenir l'usuari actual
import { getAuth, onAuthStateChanged } from "firebase/auth";

export function administradorsPage() {
  const adminMenuView = document.getElementById("admin-menu-view");
  const addAdminView = document.getElementById("add-admin-view");

  const btnShowForm = document.getElementById("btn-show-add-admin-form");
  const btnCancel = document.getElementById("btn-cancel-add-admin");
  const addAdminForm = document.getElementById("add-admin-form");
  const outputDiv = document.getElementById("admin-output");
  const btnSubmit = document.getElementById("btn-submit-admin");

  // Funció per canviar entre la vista del menú i la del formulari
  const toggleViews = () => {
    adminMenuView.style.display = adminMenuView.style.display === "none" ? "block" : "none";
    addAdminView.style.display = addAdminView.style.display === "none" ? "block" : "none";
    outputDiv.style.display = "none"; // Amaguem missatges anteriors
  };

  btnShowForm.addEventListener("click", toggleViews);
  btnCancel.addEventListener("click", toggleViews);

  // Gestionar l'enviament del formulari
  addAdminForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviant...";
    outputDiv.style.display = "none";

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        outputDiv.className = "error";
        outputDiv.textContent = "Error: Has d'estar autenticat per a realitzar aquesta acció.";
        outputDiv.style.display = "block";
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Desar Administrador";
        return;
    }

    const formData = new FormData(addAdminForm);
    const data = Object.fromEntries(formData.entries());
    data.firebase_uid = currentUser.uid; // Afegim el UID de l'admin que fa la petició

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
        addAdminForm.reset();
        setTimeout(toggleViews, 2000); // Tornem al menú després de 2 segons
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