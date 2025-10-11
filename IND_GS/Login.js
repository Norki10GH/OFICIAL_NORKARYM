// Dins de CLIENT/pages/Login.html, substitueix aquesta funció:
function onLoginSuccess(response) {
  if (response.status === 'ok') {
    // En lloc de mostrar un missatge, redirigim a la URL que ens dóna el servidor.
    window.location.href = response.redirectUrl;
  } else {
    const statusDiv = document.getElementById('status-message');
    statusDiv.className = 'error';
    statusDiv.textContent = response.message;
  }
}