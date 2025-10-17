// functions/src/controllers/adminController.js

import { getAuth } from 'firebase-admin/auth';
import { getDbPool } from '../config/db.js';
import { randomBytes } from 'crypto';

/**
 * Genera una contraseña segura y aleatoria.
 * @returns {string} Una contraseña aleatoria.
 */
function generarPasswordAleatoria() {
  // Genera 16 bytes aleatorios y los convierte a una cadena hexadecimal.
  return randomBytes(16).toString('hex');
}

/**
 * Controlador per registrar un nou administrador.
 * Crea l'usuari a Firebase Authentication i després a la base de dades PostgreSQL.
 * @param {object} req - Objecte de la petició (request).
 * @param {object} res - Objecte de la resposta (response).
 */
async function registrarNouAdmin(req, res) {
  // ATENCIÓ: Ja no rebem la contrasenya des del formulari.
  const { nom, email, notes } = req.body;

  // Validació bàsica de les dades rebudes
  if (!nom || !email) {
    return res.status(400).json({
      success: false,
      message: "El nom i l'email són obligatoris."
    });
  }

  try {
    // NOU: Generem una contrasenya segura i temporal automàticament.
    const passwordTemporal = generarPasswordAleatoria();

    // Pas 1: Crear l'usuari a Firebase Authentication amb la contrasenya generada.
    const userRecord = await getAuth().createUser({
      email: email,
      password: passwordTemporal,
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
      message: 'Administrador registrat correctament. L\'usuari haurà de restablir la seva contrasenya per poder iniciar sessió.',
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

export { registrarNouAdmin };