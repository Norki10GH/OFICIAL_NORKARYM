// OFICIAL_NORKARYM/db.js (Versió corregida amb ES Modules)
import 'dotenv/config'; // Per carregar les variables d'entorn
import pg from 'pg';

const { Pool } = pg;

// Creem el pool de connexions amb les variables d'entorn
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // Important per a connexions a Cloud SQL, especialment en producció
  ssl: {
    rejectUnauthorized: false 
  }
});

// Exportem un objecte amb un mètode 'query' per a ser utilitzat a tota l'aplicació
export default {
  query: (text, params) => pool.query(text, params),
};