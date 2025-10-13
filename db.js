// db.js

// 1. Carrega les variables d'entorn del fitxer .env
require('dotenv').config();

// 2. Importa l'objecte Pool de la llibreria 'pg'
const { Pool } = require('pg');

// 3. Crea una instància de Pool per gestionar les connexions
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // Opcional: Afegeix configuració SSL per a una connexió segura a producció
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

// 4. Crea una funció per provar la connexió
const testConnection = async () => {
  try {
    console.log('Provant de connectar a la base de dades...');
    // Agafa un client del pool i executa una consulta senzilla
    const client = await pool.connect();
    console.log('✅ Connexió establerta correctament! Client adquirit.');

    const result = await client.query('SELECT NOW()');
    console.log('🕒 Hora actual de la base de dades:', result.rows[0].now);

    // Allibera el client i el retorna al pool
    client.release();
    console.log('Client alliberat.');

  } catch (error) {
    console.error('❌ Error en connectar a la base de dades:', error.stack);
  } finally {
    // Tanca el pool de connexions
    await pool.end();
    console.log('Pool de connexions tancat.');
  }
};

// 5. Executa la funció de prova
testConnection();