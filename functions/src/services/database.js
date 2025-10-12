
export async function dbGetNewUsers() {
  // TODO: Implementar la consulta a Google Cloud SQL per obtenir usuaris pendents.
  console.log('Connectant a SQL per obtenir nous usuaris...');
  return Promise.resolve([]); // Retorna un array buit de moment.
}

export async function dbUpdateNewUser(dades) {
  // TODO: Implementar la consulta a Google Cloud SQL per actualitzar un usuari.
  console.log('Connectant a SQL per actualitzar l\'usuari:', dades);
  return Promise.resolve({ message: `Les dades de ${dades.nom} s'han actualitzat correctament.` });
}

export async function dbRegisterUser(dades) {
  // TODO: Implementar la consulta a Google Cloud SQL per registrar un nou usuari.
  console.log('Connectant a SQL per registrar l\'usuari:', dades);
  return Promise.resolve({ message: `Usuari ${dades.nom} registrat amb èxit.` });
}
