// CLIENT/src/js/pages/administradors.js

// Importem les funcions per crear els formularis/vistes
import { createAddAdminForm, createListAdminsView } from "../components/adminForms.js";

export function administradorsPage() {
  const adminMenuView = document.getElementById("admin-menu-view");
  const dynamicContentContainer = document.getElementById("dynamic-content-container");

  const btnShowForm = document.getElementById("btn-show-add-admin-form");
  const btnListAdmins = document.getElementById("btn-list-admins");

  // Funció per mostrar el menú principal i amagar el contingut dinàmic
  const showMainMenu = () => {
    adminMenuView.style.display = "block";
    dynamicContentContainer.style.display = "none";
    dynamicContentContainer.innerHTML = ""; // Netejem el contingut
  };

  // Funció per mostrar una vista de formulari/contingut
  const showDynamicView = () => {
    adminMenuView.style.display = "none";
    dynamicContentContainer.style.display = "block";
  };

  // Esdeveniment per mostrar el formulari d'afegir administrador
  btnShowForm.addEventListener("click", () => {
    showDynamicView();
    // Cridem la funció que crea el formulari i li passem els callbacks
    createAddAdminForm(dynamicContentContainer, showMainMenu, showMainMenu);
  });

  // Esdeveniment per mostrar la llista d'administradors (funcionalitat futura)
  btnListAdmins.addEventListener("click", () => {
    showDynamicView();
    createListAdminsView(dynamicContentContainer, showMainMenu);
    alert("La funcionalitat per llistar administradors encara no està implementada.");
  });
}