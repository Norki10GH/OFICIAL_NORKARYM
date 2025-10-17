// functions/index.js

// Importacions existents
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const pg = require("pg");

// ===== NOVA IMPORTACIÓ: Firebase Admin SDK =====
const admin = require("firebase-admin");

// ===== NOVA IMPORTACIÓ: Controlador d'administradors =====
const { registrarNouAdmin } = require("./src/controllers/adminController.js");

// Inicialitzem Firebase Admin (només una vegada)
admin.initializeApp();

// ... (El teu codi per getDbPassword i getDbPool es manté igual) ...

const secretManagerClient = new SecretManagerServiceClient();
let pool; 

setGlobalOptions({region: "europe-west1"});

async function getDbPassword() {
    const name = 'projects/norkarym/secrets/DB_PASSWORD/versions/latest';
    const [version] = await secretManagerClient.accessSecretVersion({ name });
    return version.payload.data.toString('utf8');
}

async function getDbPool() {
    if (pool) {
        return pool;
    }

    const dbPassword = await getDbPassword();

    const config = {
        user: 'postgres',
        password: dbPassword,
        database: 'gestio_usuaris',
        host: `/cloudsql/norkarym:europe-west1:norkarym-app-bd`
    };

    pool = new pg.Pool(config);
    return pool;
}


// La teva funció de test existent
exports.testConexionDB = onRequest({ invoker: "public" }, async (request, response) => {
    // ...
});

// ===== NOVA FUNCIÓ PER REGISTRAR ADMINISTRADORS =====
exports.registrarAdmin = onRequest({ invoker: "public" }, registrarNouAdmin);