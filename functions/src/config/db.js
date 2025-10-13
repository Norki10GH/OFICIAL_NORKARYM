// OFICIAL_NORKARYM/db.js (Versió amb inicialització mandrosa/pèrdua d'inicialització) --actualitzacio Arym-- kaka de vaka -- verda
/**
 * Database pool helper (lazy-initialized).
 * This module exports query/getPool/close wrappers and avoids creating
 * a Pool at import time to prevent network activity during Cloud Build.
 */
import "dotenv/config"; // Per carregar les variables d'entorn
import pg from "pg";

const {Pool} = pg;

// Support either a single connection string (DATABASE_URL) or individual env vars.
const connectionString = process.env.DATABASE_URL || undefined;

// Enable SSL in production or when explicitly requested via DB_SSL=true.
const useSsl = (process.env.DB_SSL === "true") || (process.env.NODE_ENV === "production");

// Build pool configuration (same as before)
const poolConfig = connectionString ?
  {
    connectionString,
    ssl: useSsl ? {rejectUnauthorized: false} : false,
  } :
  {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    ssl: useSsl ? {rejectUnauthorized: false} : false,
    // sensible defaults for connection pooling
    max: process.env.DB_POOL_MAX ? Number(process.env.DB_POOL_MAX) : 10,
    idleTimeoutMillis: 30000,
  };

// Lazy pool reference. We only create the Pool when it's first needed.
let pool;

/**
 * Initialize the PG pool on first use.
 * @return {Pool} the initialized pg Pool
 */
function initPool() {
  if (!pool) {
    pool = new Pool(poolConfig);
    // Log unexpected errors on idle clients (helps debugging in Cloud Functions)
    // eslint-disable-next-line no-console
    pool.on("error", (err) => console.error("Unexpected error on idle postgres client", err));
  }
  return pool;
}

// Convenience wrappers that ensure the pool is initialized lazily.
const query = (text, params) => initPool().query(text, params);
const getPool = () => initPool();
const close = () => (pool ? pool.end() : Promise.resolve());

export default {
  query,
  getPool,
  close,
};
