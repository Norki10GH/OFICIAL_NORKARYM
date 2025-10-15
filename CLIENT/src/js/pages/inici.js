// CLIENT/src/js/pages/inici.js

// Aquesta funció s'executarà quan el main.js detecti que estem a la pàgina d'inici
export function iniciPage() {
  const btnInscripcio = document.getElementById("btn-inscripcio");
  const btnAdmin = document.getElementById("btn-admin");

  if (btnInscripcio) {
    btnInscripcio.addEventListener("click", () => (window.location.href = "/inscripcio.html"));
  }
  if (btnAdmin) {
    btnAdmin.addEventListener("click", () => (window.location.href = "/administracio.html"));
  }
}