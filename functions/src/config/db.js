// functions/src/config/db.js

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const pg = require('pg');

// Inicialitzem el client de Secret Manager.
const secretManagerClient = new SecretManagerServiceClient();

// Declarem el pool fora per poder reutilitzar-lo (lazy initialization).
let pool;

/**
 * Obté la contrasenya de la base de dades des de Secret Manager.
 * @returns {Promise<string>} La contrasenya de la base de dades.
 */
async function getDbPassword() {
    const name = 'projects/norkarym/secrets/DB_PASSWORD/versions/latest';
    const [version] = await secretManagerClient.accessSecretVersion({ name });
    return version.payload.data.toString('utf8');
}

/**
 * Retorna el pool de connexions a la base de dades.
 * Si no existeix, el crea de forma asíncrona.
 * @returns {Promise<pg.Pool>} El pool de connexions de PostgreSQL.
 */
async function getDbPool() {
    if (pool) {
        return pool;
    }

    let dbPassword;
    try {
        dbPassword = await getDbPassword();
    } catch (err) {
        console.error('Failed to retrieve DB password from Secret Manager:', err && err.stack ? err.stack : err);
        throw new Error('Failed to obtain DB credentials from Secret Manager.');
    }

    const config = {
        user: 'postgres',
        password: dbPassword,
        database: 'gestio_usuaris',
        host: '/cloudsql/norkarym:europe-west1:norkarym-app-bd', // Connexió via socket a producció
    };

    try {
        pool = new pg.Pool(config);
        // Optional: attach generic error handler to surface unexpected client errors
        pool.on('error', (err) => {
            console.error('Postgres pool error:', err && err.stack ? err.stack : err);
        });
        return pool;
    } catch (err) {
        console.error('Failed to create Postgres pool:', err && err.stack ? err.stack : err);
        throw err;
    }
}

module.exports = { getDbPool };