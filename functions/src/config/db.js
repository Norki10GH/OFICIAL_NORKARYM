// Contenido para el archivo: functions/src/config/db.js

import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

// Determina si l'entorn és de desenvolupament local (emulador) o de producció.
// Firebase automàticament estableix aquesta variable a 'true' quan s'executa amb l'emulador.
const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";

// Configuració base comuna per a tots els entorns
const baseConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

// Configuració específica per a cada entorn
const envConfig = isEmulator
  ? {
      // --- ENTORN LOCAL (EMULADOR) ---
      // Ens connectem a través de TCP/IP al Cloud SQL Auth Proxy.
      // Aquestes variables d'entorn (DB_HOST, DB_PORT) les definiràs al teu arxiu .env local.
      host: process.env.DB_HOST || "127.0.0.1",
      port: parseInt(process.env.DB_PORT || "5432", 10),
    }
  : {
      // --- ENTORN DE PRODUCCIÓ (GOOGLE CLOUD) ---
      // Ens connectem a través del socket Unix segur que proporciona Google Cloud.
      host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    };

// Unim la configuració base amb la de l'entorn corresponent
const poolConfig = { ...baseConfig, ...envConfig };

let pool;

// La funció d'inicialització ara és més robusta
function initPool() {
  if (!pool) {
    console.log("Creant una nova instància del pool de connexions...");
    console.log(`Mode de connexió: ${isEmulator ? "Local (Emulator)" : "Producció (Cloud)"}`);
    pool = new Pool(poolConfig);
    pool.on("error", (err) => {
      console.error("Error inesperat en el client de la base de dades.", err);
      // En cas d'error greu, tanquem el procés per forçar un reinici saludable.
      process.exit(-1);
    });
  }
  return pool;
}

// Wrappers para asegurar que el pool se inicializa solo cuando se necesita
const query = (text, params) => initPool().query(text, params);
const getPool = () => initPool();
const close = () => (pool ? pool.end() : Promise.resolve());

export default {
  query,
  getPool,
  close,
};