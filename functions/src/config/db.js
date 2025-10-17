import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import pg from 'pg';

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

    const dbPassword = await getDbPassword();
    const config = {
        user: 'postgres',
        password: dbPassword,
        database: 'gestio_usuaris',
        host: '/cloudsql/norkarym:europe-west1:norkarym-app-bd', // Connexió via socket a producció
    };

    pool = new pg.Pool(config);
    return pool;
}

module.exports = { getDbPool };