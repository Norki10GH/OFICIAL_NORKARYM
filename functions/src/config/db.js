// Contenido para el archivo: functions/src/config/db.js

import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

// Configuración simplificada para usar el Proxy de Cloud SQL Auth
const poolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // Esta es la parte importante: se conecta a través de un socket seguro
  host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
};

let pool;

function initPool() {
  if (!pool) {
    pool = new Pool(poolConfig);
    pool.on("error", (err) => console.error("Error inesperado en el cliente de postgres inactivo", err));
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