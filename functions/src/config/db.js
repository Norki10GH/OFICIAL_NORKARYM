// OFICIAL_NORKARYM/db.js (Versió corregida amb ES Modules)
import 'dotenv/config'; // Per carregar les variables d'entorn
import pg from 'pg';

const { Pool } = pg;

// Support either a single connection string (DATABASE_URL) or individual env vars.
const connectionString = process.env.DATABASE_URL || undefined;

// Enable SSL in production or when explicitly requested via DB_SSL=true.
const useSsl = (process.env.DB_SSL === 'true') || (process.env.NODE_ENV === 'production');

// Build pool configuration
const poolConfig = connectionString
  ? {
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      // sensible defaults for connection pooling
      max: process.env.DB_POOL_MAX ? Number(process.env.DB_POOL_MAX) : 10,
      idleTimeoutMillis: 30000,
    };

const pool = new Pool(poolConfig);

// Log unexpected errors on idle clients (helps debugging in Cloud Functions)
pool.on('error', (err) => {
  // Avoid throwing inside a cloud function runtime unhandled
  // but ensure we log it for diagnostics.
  // eslint-disable-next-line no-console
  console.error('Unexpected error on idle postgres client', err);
});

// Export helpers: query (convenience), getPool (advanced), close (for tests/shutdown)
export default {
  query: (text, params) => pool.query(text, params),
  getPool: () => pool,
  close: () => pool.end(),
};