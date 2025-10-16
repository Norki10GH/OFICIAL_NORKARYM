const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const pg = require("pg");

// Se inicializan fuera para reutilizarlos en cada ejecución de la función
const secretManagerClient = new SecretManagerServiceClient();
let pool; // El "pool" de conexiones a la base de datos

setGlobalOptions({region: "europe-west1"});

// Función para obtener la contraseña de Secret Manager
async function getDbPassword() {
    const name = 'projects/norkarym/secrets/DB_PASSWORD/versions/latest';
    const [version] = await secretManagerClient.accessSecretVersion({ name });
    return version.payload.data.toString('utf8');
}

// Función que crea el pool de conexiones si no existe
async function getDbPool() {
    if (pool) {
        return pool;
    }

    const dbPassword = await getDbPassword();

    const config = {
        user: 'postgres',
        password: dbPassword,
        database: 'gestio_usuaris',
        // ¡Importante! Esta es la forma segura de conectar con Cloud SQL
        host: '/cloudsql/norkarym:europe-west1:norkarym-app-bd',
    };

    pool = new pg.Pool(config);
    return pool;
}

// Tu función anterior
exports.holaMundo = onRequest({ invoker: "public" }, (request, response) => {
    response.json({
        mensaje: "Hola desde el servidor de Norkarym!"
    });
});

// NUEVA FUNCIÓN para probar la conexión a la base de datos
exports.testConexionDB = onRequest({ invoker: "public" }, async (request, response) => {
    try {
        const dbPool = await getDbPool();
        // Hacemos una consulta simple para verificar la conexión
        const result = await dbPool.query('SELECT NOW()');
        
        response.status(200).json({
            success: true,
            message: "¡Conexión a la base de datos exitosa!",
            horaDelServidorDB: result.rows[0].now,
        });

    } catch (error) {
        console.error("Error conectando a la base de datos:", error);
        response.status(500).json({
            success: false,
            message: "Error al conectar con la base de datos.",
            error: error.message,
        });
    }
});