// Fitxer: KKonstants.gs


const NOM_EMPRESA = 'KÄRŸ';
// IMPORTANT: Introdueix aquí els correus reals dels administradors
const ADMIN_EMAILS ='norki10@norkarym.com,arym10@norkarym.com';
// --- NOU CODI D'ADMINISTRACIÓ ---
const ADMIN_CODE = '1001'; // Pots canviar aquest codi quan vulguis



const SPREADSHEET_ID = '161FNc3n_DVRatKIIMRbJ-tY1EM4zhULkQhxzbVAmf_Q'; // FULL USUARIS
const TEMPLATE_ID = '1AUK0I5VTIMe-ntEtP30Sd9jU0RUCROMODYe_AJmF9Uk'; // FULL CALCUL BASE DE DADES QUE ES COPIA

const SCRIPT_BASE_URL = ScriptApp.getService().getUrl(); // URL base del projecte desplegat
const SHEET_NEW_USERS = '-NEW USERS-';
const SHEET_REG_USERS = '-REG USERS-';

//constants noms url html!!!!!!

const Dashboard = "Dashboard"
const Login = "Login"
const Admin = "Admin"
const Newuser = "Newuser"
const AF_GALLINA = "AF_GALLINA"
const AF_CLIENTS = "AF_CLIENTS"
const PAG_INDEF = "PAG_INDEF"
const PAG_0 = "PAG_0"







// --- CONFIGURACIÓ ---

const EMAIL_COLUMN = 2; // La columna B és la 2a
const PASSWORD_COLUMN = 20; // La columna T és la 20a










// Mapeig de columnes per a la fulla "-NEW USERS-"
// Facilita la lectura i el manteniment del codi.
const NEW_USERS_COLS = {
  ID: 1,
  EMAIL: 2,
  NOM: 3,
  COGNOMS: 4,
  DNI: 5,
  ADRECA: 6,
  POBLACIO: 7,
  PAIS: 8,
  CODI_POSTAL: 9,
  DATA_SOLLICITUD: 10,
  TELEFON: 11 // S'assumeix que el telèfon anirà a la columna K
};

// Mapeig de columnes per a la fulla "-REG USERS-"
const REG_USERS_COLS = {
  ID_REGISTRE: 1,
  EMAIL: 2,
  URL_SHEET: 3,
  NOM: 4,
  COGNOMS: 5,
  TELEFON: 6,
  DNI: 7,
  ADRECA: 8,
  POBLACIO: 9,
  PAIS: 10,
  CODI_POSTAL: 11,
  ID_USER_ORIGINAL: 12,
  DATA_SOLLICITUD: 13,
  DATA_REGISTRE: 14,
  REGISTRAT: 15,
  DATA_COBRAMENT: 16,
  METODE_PAGAMENT: 17,
  COBRAT: 18,
  QUANTITAT_PAGADA: 19 // Columna S
};