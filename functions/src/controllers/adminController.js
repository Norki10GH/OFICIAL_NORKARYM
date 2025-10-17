// functions/src/controllers/adminController.js

const { getAuth } = require('firebase-admin/auth');
const { getDbPool } = require('../config/db.js');

/**
 * Controlador per registrar un nou administrador.
 * Crea l'usuari a Firebase Authentication i després a la base de dades PostgreSQL.
 * @param {object} req - Objecte de la petició (request).
 * @param {object} res - Objecte de la resposta (response).
 */
async function registrarNouAdmin(req, res) {
  const { nom, email, password, notes } = req.body;

  // Validació bàsica de les dades rebudes
  if (!nom || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "El nom, l'email i la contrasenya són obligatoris."
    });
  }

  try {
    // Pas 1: Crear l'usuari a Firebase Authentication
    const userRecord = await getAuth().createUser({
      email: email,
      password: password,
      displayName: nom
    });

    const firebaseUid = userRecord.uid;

    // Pas 2: Inserir les dades a la base de dades PostgreSQL
    const pool = await getDbPool();
    const query = `
      INSERT INTO taula_admins_nk (firebase_uid_admin_nk, nom_admin_nk, email_admin_nk, notes_admin_nk)
      VALUES ($1, $2, $3, $4)
      RETURNING id_admin_nk, nom_admin_nk, email_admin_nk, data_creacio_admin_nk;
    `;
    const values = [firebaseUid, nom, email, notes || null];

    const result = await pool.query(query, values);

    // Pas 3: Retornar una resposta d'èxit
    res.status(201).json({
      success: true,
      message: 'Administrador registrat correctament.',
      admin: result.rows[0]
    });

  } catch (error) {
    console.error("Error en registrar l'administrador:", error);

    // Gestionem errors comuns de Firebase Auth
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({
        success: false,
        message: "L'adreça d'email ja està en ús."
      });
    }

    // Error genèric per a altres problemes
    res.status(500).json({
      success: false,
      message: "Error intern del servidor en registrar l'administrador.",
      error: error.message
    });
  }
}

module.exports = { registrarNouAdmin };