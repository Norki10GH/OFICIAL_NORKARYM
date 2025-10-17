// functions/src/controllers/adminController.js

const { getAuth } = require('firebase-admin/auth');
const { getDbPool } = require('../config/db.js');
const { randomBytes } = require('crypto');

/**
 * Genera una contraseña segura y aleatoria.
 * @returns {string} Una contraseña aleatoria.
 */
function generarPasswordAleatoria() {
  return randomBytes(16).toString('hex');
}

/**
 * Inserta un registre a la taula d'auditoria.
 * @param {object} auditData - Dades de l'auditoria.
 */
async function registrarAuditoria(auditData) {
  const { id_admin_nk, accio_nk, id_objectiu_nk, taula_objectiu_nk, valor_nou_nk } = auditData;
  const pool = await getDbPool();
  const query = `
    INSERT INTO taula_auditoria_nk (id_admin_nk, accio_nk, id_objectiu_nk, taula_objectiu_nk, valor_nou_nk)
    VALUES ($1, $2, $3, $4, $5);
  `;
  const values = [id_admin_nk || null, accio_nk, id_objectiu_nk, taula_objectiu_nk, valor_nou_nk];
  await pool.query(query, values);
}


/**
 * Controlador per registrar un nou administrador.
 * @param {object} req - Objecte de la petició (request).
 * @param {object} res - Objecte de la resposta (response).
 */
async function registrarNouAdmin(req, res) {
  const { nom, email, notes } = req.body;

  if (!nom || !email) {
    return res.status(400).json({
      success: false,
      message: "El nom i l'email són obligatoris."
    });
  }

  try {
    const passwordTemporal = generarPasswordAleatoria();

    const userRecord = await getAuth().createUser({
      email: email,
      password: passwordTemporal,
      displayName: nom
    });

    const firebaseUid = userRecord.uid;

    const pool = await getDbPool();
    const dbQuery = `
      INSERT INTO taula_admins_nk (firebase_uid_admin_nk, nom_admin_nk, email_admin_nk, notes_admin_nk)
      VALUES ($1, $2, $3, $4)
      RETURNING id_admin_nk, nom_admin_nk, email_admin_nk, data_creacio_admin_nk;
    `;
    const values = [firebaseUid, nom, email, notes || null];

    const result = await pool.query(dbQuery, values);
    const nouAdmin = result.rows[0];

    // Registrar l'acció a la taula d'auditoria
    await registrarAuditoria({
      accio_nk: 'CREACIO_ADMINISTRADOR',
      id_objectiu_nk: nouAdmin.id_admin_nk,
      taula_objectiu_nk: 'taula_admins_nk',
      valor_nou_nk: JSON.stringify(nouAdmin)
    });

    res.status(201).json({
      success: true,
      message: 'Administrador registrat correctament. L\'usuari haurà de restablir la seva contrasenya.',
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