// Fitxer: KOF_KARY/ASERV/COM_GS/Code.js (Versió Segura)

/**
 * Funció principal que actua com a 'router'. Decideix quina pàgina mostrar.
 */
function doGet(e) {
  const page = e.parameter.page;
  const userCache = CacheService.getUserCache();
  const loggedInUserEmail = userCache.get('userEmail');
  const isAdminAuthenticated = userCache.get('isAdmin') === 'true';
  let template;

  // Pàgina pública de registre
  if (page === 'Newuser') {
    template = HtmlService.createTemplateFromFile('Newuser');
  
  // Lògica per a la pàgina d'administració
  } else if (page === 'Admin') {
    if (isAdminAuthenticated) {
      template = HtmlService.createTemplateFromFile('Admin'); // Si ja està autenticat, mostra el panell
    } else {
      template = HtmlService.createTemplateFromFile('AdminLogin'); // Si no, demana el codi
    }

  // Pàgines privades que requereixen login d'usuari
  } else if (loggedInUserEmail) {
    const privatePage = page || 'Dashboard';
    switch (privatePage) {
      case 'Dashboard':
        template = HtmlService.createTemplateFromFile('Dashboard');
        break;
      case 'AF_CLIENTS':
        template = HtmlService.createTemplateFromFile('AF_CLIENTS');
        break;
      default:
        template = HtmlService.createTemplateFromFile('PAG_INDEF');
    }
  
  // Si no és cap de les anteriors i no hi ha sessió, envia al Login
  } else {
    template = HtmlService.createTemplateFromFile('Login');
  }

  const htmlOutput = template.evaluate();
  htmlOutput
    .setTitle('KÄRŸ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return htmlOutput;
}

/**
 * Funció per verificar el codi d'administrador.
 */
function verifyAdminCode(code) {
  if (code === ADMIN_CODE) {
    CacheService.getUserCache().put('isAdmin', 'true', 3600); // Autenticació vàlida per 1 hora
    return { status: 'ok' };
  } else {
    return { status: 'error', message: 'Codi incorrecte.' };
  }
}


// ... (La resta del fichero: doPost, include, getScriptUrl, checkUser, etc., no cambia) ...

/**
 * Funció per gestionar les peticions POST (formularis de registre, etc.).
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    let result;

    if (!payload.action) {
      result = processNewUser(payload); // Funció de Newuser.js
    } else {
      switch (payload.action) {
        case 'getNewUsers':
          result = getNewUsers(); // Funció d'Admin.js
          break;
        case 'getUsersSummary':
          result = getUsersSummary(); // Funció d'Admin.js
          break;
        case 'updateNewUser':
          result = updateNewUser(payload.dades); // Funció d'Admin.js
          break;
        case 'registerNewUser':
          result = registerNewUser(payload.dades); // Funció d'Admin.js
          break;
        case 'sendContactEmail':
          result = sendContactEmail(payload.dades); // Funció de Newuser.js
          break;
        default:
          throw new Error(`Acció desconeguda: ${payload.action}`);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log(`ERROR a doPost: ${error.message}`);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===============================================
// === FUNCIONS D'UTILITAT I D'AUTENTICACIÓ ======
// ===============================================

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

function checkUser(email) {
  if (!email) return { status: 'error', message: 'L\'email no pot estar buit.' };
  
  const sheet = getRegUsersSheet(); // Funció de Database.js
  const dataRange = sheet.getRange(2, EMAIL_COLUMN, sheet.getLastRow() - 1, 1);
  const emailList = dataRange.getValues();
  
  for (let i = 0; i < emailList.length; i++) {
    if (emailList[i][0].toLowerCase().trim() === email.toLowerCase().trim()) {
      const row = i + 2;
      const password = sheet.getRange(row, PASSWORD_COLUMN).getValue();
      return password ? { status: 'password_exists', row: row } : { status: 'new_password_required', row: row };
    }
  }
  return { status: 'not_found' };
}

function setPassword(data) {
  try {
    getRegUsersSheet().getRange(data.row, PASSWORD_COLUMN).setValue(data.password);
    return { status: 'ok', message: 'Contrasenya establerta correctament!' };
  } catch (e) {
    return { status: 'error', message: 'Error en desar la contrasenya: ' + e.message };
  }
}


function verifyLogin(data) {
  const sheet = getRegUsersSheet();
  const storedPassword = sheet.getRange(data.row, PASSWORD_COLUMN).getValue();
  
  if (storedPassword === data.password) {
    const userEmail = sheet.getRange(data.row, EMAIL_COLUMN).getValue();
    CacheService.getUserCache().put('userEmail', userEmail, 21600); // Inicia la sessió
    const redirectUrl = getScriptUrl() + '?page=Dashboard';
    return { status: 'ok', redirectUrl: redirectUrl };
  } else {
    return { status: 'error', message: 'La contrasenya és incorrecta.' };
  }
}