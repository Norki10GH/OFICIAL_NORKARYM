// Fitxer: Admin.gs

function getNewUsers() {
  return dbGetNewUsers();
}

function getUsersSummary() {
  const users = dbGetNewUsers();
  if (!users || users.length === 0) {
    return { total: 0, users: [] };
  }

  return {
    total: users.length,
    users: users // Ja contenen les dades necessàries
  };
}

function updateNewUser(dades) {
  if (!dades.fila) throw new Error("No s'ha proporcionat la fila a modificar.");
  return dbUpdateNewUser(dades);
}

function registerNewUser(dades) {
  if (!dades.id ||!dades.email ||!dades.nom ||!dades.telèfon) {
    throw new Error("Falten dades obligatòries per registrar l'usuari.");
  }
  return dbRegisterUser(dades);
}