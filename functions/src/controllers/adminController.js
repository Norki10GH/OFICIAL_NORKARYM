// functions/src/controllers/adminController.js

const { getAuth } = require('firebase-admin/auth');
const { getDbPool } = require('../config/db.js');
// Ja no necessitem 'crypto' si l'usuari estableix la seva contrasenya
// const { randomBytes } = require('crypto');

/**
 * Inserta un registre a la taula d'auditoria amb gestió d'errors pròpia.
 * @param {object} auditData - Dades de l'auditoria.
 */
async function registrarAuditoria(auditData) {
  // Canviem el nom del paràmetre per a més claredat: qui fa l'acció?
  const { id_admin_actor_nk, accio_nk, id_objectiu_nk, taula_objectiu_nk, valor_nou_nk } = auditData;
  
  try {
    const pool = await getDbPool();
    const query = `
      INSERT INTO taula_auditoria_nk (id_admin_nk, accio_nk, id_objectiu_nk, taula_objectiu_nk, valor_nou_nk)
      VALUES ($1, $2, $3, $4, $5);
    `;
    // Usem l'ID de l'actor, que pot ser nul si l'acció és del sistema (com un registre)
    const values = [id_admin_actor_nk || null, accio_nk, id_objectiu_nk, taula_objectiu_nk, valor_nou_nk];
    await pool.query(query, values);

  } catch (dbError) {
    // **AQUEST ÉS EL CANVI CLAU**: Captura i mostra qualsevol error de la base de dades.
    console.error("ERROR CRÍTIC: No s'ha pogut guardar el registre d'auditoria.", dbError);
    // No llancem l'error per no aturar el procés principal, però el deixem registrat.
  }
}

/**
 * Controlador per registrar un nou administrador.
 * @param {object} req - Objecte de la petició (request).
 * @param {object} res - Objecte de la resposta (response).
 */
async function registrarNouAdmin(req, res) {
  const { nom, email, password, notes } = req.body;

  if (!nom || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "El nom, l'email i la contrasenya són obligatoris."
    });
  }

  if (password.length < 8) {
      return res.status(400).json({
          success: false,
          message: "La contrasenya ha de tenir com a mínim 8 caràcters."
      });
  }

  try {
    // 1. Crear l'usuari a Firebase Authentication amb la contrasenya rebuda
    const userRecord = await getAuth().createUser({
      email: email,
      password: password,
      displayName: nom
    });

    const firebaseUid = userRecord.uid;

    // 2. Inserir les dades a la base de dades SQL
    const pool = await getDbPool();
    const dbQuery = `
      INSERT INTO taula_admins_nk (firebase_uid_admin_nk, nom_admin_nk, email_admin_nk, notes_admin_nk)
      VALUES ($1, $2, $3, $4)
      RETURNING id_admin_nk, nom_admin_nk, email_admin_nk, data_creacio_admin_nk;
    `;
    const values = [firebaseUid, nom, email, notes || null];

    const result = await pool.query(dbQuery, values);
    const nouAdmin = result.rows[0];

    // 3. Registrar l'acció a la taula d'auditoria
    await registrarAuditoria({
      id_admin_actor_nk: null, // Explícitament nul perquè no hi ha un admin realitzant l'acció.
      accio_nk: 'CREACIO_ADMINISTRADOR',
      id_objectiu_nk: nouAdmin.id_admin_nk,
      taula_objectiu_nk: 'taula_admins_nk',
      valor_nou_nk: JSON.stringify(nouAdmin)
    });

    // 4. Enviar resposta d'èxit
    res.status(201).json({
      success: true,
      message: 'Administrador registrat correctament.',
      admin: nouAdmin
    });

  } catch (error) {
    console.error("Error en registrar l'administrador:", error);

    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({
        success: false,
        message: "L'adreça d'email ja està en ús."
      });
    }

    res.status(500).json({
      success: false,
      message: "Error intern del servidor en registrar l'administrador.",
      error: error.message
    });
  }
}

module.exports = { registrarNouAdmin };