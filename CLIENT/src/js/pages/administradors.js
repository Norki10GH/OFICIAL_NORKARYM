// CLIENT/src/js/pages/administradors.js

import { createAddAdminForm } from "../components/adminForms.js";

export function administradorsPage() {
  const adminMenuView = document.getElementById("admin-menu-view");
  const dynamicContentContainer = document.getElementById("dynamic-content-container");
  const btnShowForm = document.getElementById("btn-show-add-admin-form");

  // Funció per mostrar el menú principal i amagar el formulari
  const showMainMenu = () => {
    adminMenuView.style.display = "block";
    dynamicContentContainer.style.display = "none";
    dynamicContentContainer.innerHTML = ""; // Netejem el contingut
  };

  // Funció per mostrar el formulari
  const showDynamicView = () => {
    adminMenuView.style.display = "none";
    dynamicContentContainer.style.display = "block";
  };

  // Quan es clica el botó "Afegir Nou Administrador"
  if (btnShowForm) {
    btnShowForm.addEventListener("click", () => {
      showDynamicView();
      // Cridem la funció que crea el formulari
      createAddAdminForm(dynamicContentContainer, showMainMenu, showMainMenu);
    });
  }
}