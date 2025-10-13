// CLIENT/src/js/pages/inici.js

// Aquesta funció s'executarà quan el main.js detecti que estem a la pàgina d'inici
export function iniciPage() {
  const btnAnarAMenu = document.getElementById('btn-anar-a-menu');

  if (btnAnarAMenu) {
    btnAnarAMenu.addEventListener('click', () => {
      // Redirigim a la pàgina d'inscripció que està dins de src/pages
      window.location.href = '/src/pages/inscripcio.html';
    });
  }
}