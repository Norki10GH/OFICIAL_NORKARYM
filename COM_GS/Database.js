// Fitxer: Database.gs

function getDb() { return SpreadsheetApp.openById(SPREADSHEET_ID); }
function getNewUsersSheet() { return getDb().getSheetByName(SHEET_NEW_USERS); }
function getRegUsersSheet() { return getDb().getSheetByName(SHEET_REG_USERS); }


// Afegeix aquesta funció al teu fitxer Database.js

/**
 * Obté la URL del full de càlcul de l'usuari que ha iniciat sessió.
 * Llegeix l'email de la memòria cau (CacheService).
 * @returns {string} La URL del full de càlcul de l'usuari.
 * @throws {Error} Si la sessió no està iniciada o l'usuari no es troba.
 */
// Fitxer: codis GS/Database.js (Afegeix aquesta funció)

/**
 * Obté la URL del full de càlcul de l'usuari que té la sessió iniciada.
 * Aquesta és la funció clau que connecta la sessió amb les dades.
 * @returns {string} La URL del full de càlcul de l'usuari.
 */
function getUserSheetUrlFromSession() {
  const loggedInUserEmail = CacheService.getUserCache().get('userEmail');

  if (!loggedInUserEmail) {
    throw new Error("Sessió caducada. Si us plau, torna a iniciar sessió.");
  }

  const regSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_REG_USERS);
  const data = regSheet.getRange("B2:C" + regSheet.getLastRow()).getValues(); // Llegeix Email (B) i URL (C)

  for (const row of data) {
    const email = row[0];
    const sheetUrl = row[1];
    if (email && email.toLowerCase() === loggedInUserEmail.toLowerCase()) {
      return sheetUrl;
    }
  }

  throw new Error("No s'ha trobat un full de càlcul associat al teu usuari.");
}



/**
 * CORREGIT: Llegeix els usuaris i els converteix a un format JSON correcte.
 * VERSIÓ MILLORADA: Afegeix una comprovació per si la fulla no existeix.
 */
function dbGetNewUsers() {
  const sheet = getNewUsersSheet();
  
  // Comprovació de seguretat: ens assegurem que la fulla existeix.
  if (!sheet) {
    Logger.log("ERROR: La fulla amb el nom '" + SHEET_NEW_USERS + "' no s'ha trobat.");
    throw new Error("No s'ha trobat la fulla de nous usuaris. Comprova que el nom és correcte.");
  }

  if (sheet.getLastRow() < 2) {
    return []; // Retorna un array buit si no hi ha usuaris
  }

  const numColumns = Object.keys(NEW_USERS_COLS).length;
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, numColumns).getValues();
  
  const users = data.map((row, index) => {
    // Ignora files si el NOM indica que ha estat esborrat ('usuario eliminado') o si la fila està buida
    if (!row || !row[0] || row[NEW_USERS_COLS.NOM - 1] === 'usuario eliminado') {
      return null;
    }
    // Construeix un objecte estructurat per a cada usuari
    return {
      fila: index + 2,
      id: row[NEW_USERS_COLS.ID - 1],
      email: row[NEW_USERS_COLS.EMAIL - 1],
      nom: row[NEW_USERS_COLS.NOM - 1],
      cognoms: row[NEW_USERS_COLS.COGNOMS - 1],
      dni: row[NEW_USERS_COLS.DNI - 1],
      adreca: row[NEW_USERS_COLS.ADRECA - 1],
      poblacio: row[NEW_USERS_COLS.POBLACIO - 1],
      pais: row[NEW_USERS_COLS.PAIS - 1],
      codiPostal: row[NEW_USERS_COLS.CODI_POSTAL - 1],
      dataSolicitud: row[NEW_USERS_COLS.DATA_SOLLICITUD - 1] instanceof Date ? row[NEW_USERS_COLS.DATA_SOLLICITUD - 1].toLocaleDateString('ca-ES') : row[NEW_USERS_COLS.DATA_SOLLICITUD - 1],
      telèfon: row[NEW_USERS_COLS.TELEFON - 1] || ''
    };
  }).filter(Boolean); // Neteja les files nul·les
  
  return users;
}






/**
 * Actualitza les dades d'un usuari a la fulla de nous usuaris.
 * S'actualitzen les cel·les individualment per evitar sobreescriure dades incorrectes.
 * @param {object} dades - Les dades de l'usuari a actualitzar, incloent la fila.
 * @returns {object} Un missatge de confirmació.
 */
function dbUpdateNewUser(dades) {
  const sheet = getNewUsersSheet();
  const fila = parseInt(dades.fila, 10);
  if (!fila || fila < 2) {
    throw new Error("La fila proporcionada per actualitzar no és vàlida.");
  }

  // Actualitzem cada camp per separat per a més seguretat i claredat
  sheet.getRange(fila, NEW_USERS_COLS.EMAIL).setValue(dades.email);
  sheet.getRange(fila, NEW_USERS_COLS.NOM).setValue(dades.nom);
  sheet.getRange(fila, NEW_USERS_COLS.COGNOMS).setValue(dades.cognoms);
  sheet.getRange(fila, NEW_USERS_COLS.DNI).setValue(dades.dni);
  sheet.getRange(fila, NEW_USERS_COLS.ADRECA).setValue(dades.adreca);
  sheet.getRange(fila, NEW_USERS_COLS.POBLACIO).setValue(dades.poblacio);
  sheet.getRange(fila, NEW_USERS_COLS.PAIS).setValue(dades.pais);
  sheet.getRange(fila, NEW_USERS_COLS.CODI_POSTAL).setValue(dades.codiPostal);
  sheet.getRange(fila, NEW_USERS_COLS.TELEFON).setValue(dades.telèfon);

  return { message: `Les dades de ${dades.nom} s'han actualitzat correctament.` };
}

/**
 * Registra un nou usuari: el mou de '-NEW USERS-' a '-REG USERS-',
 * crea la seva fitxa de client a Drive i envia les notificacions per correu.
 * @param {object} dades - Dades completes de l'usuari a registrar.
 * @returns {object} Un missatge de confirmació amb el nou ID.
 */
function dbRegisterUser(dades) {
  const regSheet = getRegUsersSheet();
  const newUsersSheet = getNewUsersSheet();

  // 1. Generar nou ID per a l'usuari registrat
  const lastRow = regSheet.getLastRow();
  const lastId = lastRow > 1 ? regSheet.getRange(lastRow, REG_USERS_COLS.ID_REGISTRE).getValue() : 0;
  const newId = (typeof lastId === 'number' ? lastId : 0) + 1;

  // 2. Crear una carpeta per a l'usuari i copiar la fitxa de client a dins
  const nomUsuari = `${dades.nom} ${dades.cognoms}`;
  let nouFitxerUrl = '';
  try {
    const plantilla = DriveApp.getFileById(TEMPLATE_ID);
    const parents = plantilla.getParents();
    if (!parents.hasNext()) {
      throw new Error("La plantilla no es troba a cap carpeta.");
    }
    const carpetaPlantilla = parents.next();

    // Crear la nova carpeta per a l'usuari
    const nomNovaCarpeta = `${newId} - ${nomUsuari} (${dades.email})`;
    const novaCarpeta = carpetaPlantilla.createFolder(nomNovaCarpeta);

    // Copiar la plantilla dins de la nova carpeta
    const nouNomFitxer = `Fitxa Client - ${newId} - ${nomUsuari}`;
    const nouFitxer = plantilla.makeCopy(nouNomFitxer, novaCarpeta);
    nouFitxerUrl = nouFitxer.getUrl();
  } catch (e) {
    Logger.log(`Error en crear la carpeta o el fitxer per a ${nomUsuari}: ${e.message}\nStack: ${e.stack}`);
    throw new Error(`No s'ha pogut crear la fitxa de client. Error: ${e.message}`);
  }

  // 3. Construir la nova fila per a '-REG USERS-' de manera estructurada
  // El format de data 'YYYY-MM-DD' és més segur per a la conversió
  const dataSolicitud = dades.dataSolicitud ? new Date(dades.dataSolicitud.split('/').reverse().join('-')) : null;
  const dataCobrament = dades.dataCobrament ? new Date(dades.dataCobrament) : null;

  const newRow = [];
  newRow[REG_USERS_COLS.ID_REGISTRE - 1] = newId;
  newRow[REG_USERS_COLS.EMAIL - 1] = dades.email;
  newRow[REG_USERS_COLS.URL_SHEET - 1] = nouFitxerUrl;
  newRow[REG_USERS_COLS.NOM - 1] = dades.nom;
  newRow[REG_USERS_COLS.COGNOMS - 1] = dades.cognoms;
  newRow[REG_USERS_COLS.TELEFON - 1] = dades.telèfon;
  newRow[REG_USERS_COLS.DNI - 1] = dades.dni;
  newRow[REG_USERS_COLS.ADRECA - 1] = dades.adreca;
  newRow[REG_USERS_COLS.POBLACIO - 1] = dades.poblacio;
  newRow[REG_USERS_COLS.PAIS - 1] = dades.pais;
  newRow[REG_USERS_COLS.CODI_POSTAL - 1] = dades.codiPostal;
  newRow[REG_USERS_COLS.ID_USER_ORIGINAL - 1] = dades.id;
  newRow[REG_USERS_COLS.DATA_SOLLICITUD - 1] = dataSolicitud;
  newRow[REG_USERS_COLS.DATA_REGISTRE - 1] = new Date();
  newRow[REG_USERS_COLS.REGISTRAT - 1] = true;
  newRow[REG_USERS_COLS.DATA_COBRAMENT - 1] = dataCobrament;
  newRow[REG_USERS_COLS.METODE_PAGAMENT - 1] = dades.metodeCobrament;
  newRow[REG_USERS_COLS.COBRAT - 1] = dades.cobrat;
  newRow[REG_USERS_COLS.QUANTITAT_PAGADA - 1] = dades.quantitatPagada;

  regSheet.appendRow(newRow);

  // 4. Enviar correus de notificació
  try {
    sendUserConfirmationEmail(dades, newId);
    sendAdminNotificationEmail(dades, newId, nouFitxerUrl);
  } catch (e) {
    Logger.log(`Error en enviar correus per a ${nomUsuari} (ID: ${newId}): ${e.message}`);
    // Opcional: Podries afegir una nota a la fila de l'usuari indicant que l'email ha fallat.
  }

  // 5. Eliminar la fila de la fulla de nous usuaris
  newUsersSheet.deleteRow(parseInt(dades.fila, 10));

  return { message: `Usuari ${nomUsuari} registrat amb èxit amb l'ID ${newId}.` };
}

function sendUserConfirmationEmail(userData, newId) {
  const subject = `Confirmació de registre a ${NOM_EMPRESA}`;
  const body = `<p>Benvingut/da ${userData.nom},</p><p>Et confirmem que el teu registre al nostre servei s'ha completat amb èxit.</p><p>El teu número de client és: <strong>${newId}</strong>.</p><p>Gràcies per confiar en ${NOM_EMPRESA}.</p><p>Atentament,<br>L'equip de ${NOM_EMPRESA}</p>`; // Corregit: Nom de la variable
  MailApp.sendEmail({ to: userData.email, subject: subject, htmlBody: body });
}

function sendAdminNotificationEmail(userData, newId, fileUrl) {
  const subject = `Nou usuari registrat: ${userData.nom} ${userData.cognoms}`;
  const dataCobramentText = userData.dataCobrament ? new Date(userData.dataCobrament).toLocaleDateString('ca-ES') : 'No especificada';
  const body = `<h2>Resum del Nou Client Registrat</h2><ul><li><strong>ID Client:</strong> ${newId}</li><li><strong>Nom Complet:</strong> ${userData.nom} ${userData.cognoms}</li><li><strong>Email:</strong> ${userData.email}</li><li><strong>Telèfon:</strong> ${userData.telèfon || 'No especificat'}</li></ul><h3>Detalls del Cobrament</h3><ul><li><strong>Data:</strong> ${dataCobramentText}</li><li><strong>Mètode:</strong> ${userData.metodeCobrament || 'No especificat'}</li><li><strong>Quantitat:</strong> ${userData.quantitatPagada || 'No especificada'} €</li><li><strong>Estat:</strong> ${userData.cobrat ? 'Cobrat' : 'Pendent'}</li></ul><p>Pots accedir a la seva fitxa de client aquí: <a href="${fileUrl}">Veure Fitxa</a></p>`;
  MailApp.sendEmail({ to: ADMIN_EMAILS, subject: subject, htmlBody: body });
}

/**
 * Afegeix una nova sol·licitud d'usuari a la fulla '-NEW USERS-'.
 * Aquesta funció és cridada des del formulari públic Newuser.html.
 * @param {object} dades - Les dades de l'usuari provinents del formulari.
 * @returns {object} Un missatge de confirmació.
 */
function dbAddNewUser(dades) {
  const sheet = getNewUsersSheet();
  
  // 1. Generar un nou ID per a la sol·licitud
  const lastRow = sheet.getLastRow();
  const lastId = lastRow > 1 ? sheet.getRange(lastRow, NEW_USERS_COLS.ID).getValue() : 0;
  const newId = (typeof lastId === 'number' ? lastId : 0) + 1;

  // 2. Construir la fila amb les dades rebudes
  const newRow = [];
  newRow[NEW_USERS_COLS.ID - 1] = newId;
  newRow[NEW_USERS_COLS.EMAIL - 1] = dades.email;
  newRow[NEW_USERS_COLS.NOM - 1] = dades.nom;
  newRow[NEW_USERS_COLS.COGNOMS - 1] = dades.cognoms;
  newRow[NEW_USERS_COLS.DNI - 1] = dades.dni;
  newRow[NEW_USERS_COLS.ADRECA - 1] = dades.adreca;
  newRow[NEW_USERS_COLS.POBLACIO - 1] = dades.poblacio;
  newRow[NEW_USERS_COLS.PAIS - 1] = dades.pais;
  newRow[NEW_USERS_COLS.CODI_POSTAL - 1] = dades.codiPostal;
  newRow[NEW_USERS_COLS.DATA_SOLLICITUD - 1] = new Date(); // Data actual
  newRow[NEW_USERS_COLS.TELEFON - 1] = dades.telèfon;

  // 3. Afegir la nova fila a la fulla de càlcul
  sheet.appendRow(newRow);

  // 4. Retornar un missatge d'èxit
  return { status: 'success', message: `La teva sol·licitud amb ID ${newId} s'ha enviat correctament. Contactarem amb tu aviat.` };
}


////////////////////////////////////
