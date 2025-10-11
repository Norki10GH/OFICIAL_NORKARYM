/**
 * @file Newuser.gs
 * @description Funcions relacionades amb la gestió de nous usuaris.
 */

/**
 * Processa les dades d'un nou usuari, les valida, les desa al full i envia una notificació.
 * @param {Object} data Les dades del formulari rebudes del client.
 * @returns {Object} Un objecte amb l'estat de l'operació.
 */
function processNewUser(data) {
  
  // --- VALIDACIÓ ANTI-SPAM AL SERVIDOR ---
  if (!data.email || typeof data.email !== 'string' || data.email.trim() === '' || !data.email.toLowerCase().endsWith('@gmail.com')) {
    // Si la validació falla, llancem un error que serà capturat pel 'catch' a doPost.
    throw new Error('És obligatori un email de Gmail vàlid.');
  }

  const sheet = getNewUsersSheet();
  const newId = (sheet.getLastRow() > 1 ? sheet.getRange(sheet.getLastRow(), 1).getValue() : 0) + 1;

  const newRow = [
    newId,
    data.email,
    data.nom,
    data.cognoms,
    data.dni,
    data.adreca,
    data.poblacio,
    data.pais,
    "'" + data.codiPostal, // El prefix ' evita que Sheets ho interpreti com un número i perdi els zeros inicials.
    new Date(), // Data i hora actuals de la inscripció.
    data.telèfon || '' // Afegeix el telèfon
  ];

  sheet.appendRow(newRow);
  sendNewUserNotification(data, newId);

  return { status: 'success', message: 'Inscripció registrada correctament.', userId: newId };
}

/**
 * Construeix i envia un correu electrònic de notificació amb les dades de la nova inscripció.
 * @param {Object} data Les dades del formulari.
 * @param {number} userId L'ID assignat al nou usuari.
 */
function sendNewUserNotification(data, userId) {
  const subject = `Nova Inscripció KÄRŸ - Usuari #${userId} - ${data.nom} ${data.cognoms}`;
  
  let body = `
    S'ha rebut una nova inscripció a través del web.
    
    ========================================
    DADES DEL NOU USUARI (ID: ${userId})
    ========================================
    
    Nom Complet: ${data.nom} ${data.cognoms}
    Email: ${data.email}
    DNI: ${data.dni}
    Telèfon: ${data.telèfon || 'No especificat'}
    
    Adreça: ${data.adreca}
    Població: ${data.poblacio}
    Codi Postal: ${data.codiPostal}
    País: ${data.pais}
  `;

  if (data.comentaris && data.comentaris.trim() !== '') {
    body += `
    ========================================
    COMENTARIS ADDICIONALS
    ========================================
    
    ${data.comentaris}
    `;
  }
  
  body += `
    
    ----------------------------------------
    Aquest és un missatge automàtic.
  `;
  
  MailApp.sendEmail(ADMIN_EMAILS, subject, body);
}

/**
 * Envia un correu electrònic de contacte als administradors.
 * @param {Object} data Les dades del formulari de contacte (nom, email, missatge).
 * @returns {Object} Un objecte amb l'estat de l'operació.
 */
function sendContactEmail(data) {
  if (!data || !data.email || !data.nom || !data.missatge) {
    throw new Error('Tots els camps són obligatoris.');
  }

  const subject = `Nova consulta des del web - ${data.nom}`;
  const body = `
    S'ha rebut una nova consulta a través del formulari de contacte del web.
    
    ========================================
    DADES DEL REMITENT
    ========================================
    Nom: ${data.nom}
    Email: ${data.email}
    
    Missatge:
    ${data.missatge}
  `;

  MailApp.sendEmail(ADMIN_EMAILS, subject, body, { replyTo: data.email });
  return { status: 'success', message: 'La teva consulta s\'ha enviat correctament. Et respondrem tan aviat com sigui possible.' };
}