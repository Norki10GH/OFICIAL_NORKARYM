// functions/src/controllers/adminController.js

const { getAuth } = require('firebase-admin/auth');
const { getDbPool } = require('../config/db.js');
const { registrarAuditoria } = require('../utils/auditLogger'); // <-- CANVI

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
    const userRecord = await getAuth().createUser({
      email: email,
      password: password,
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

    await registrarAuditoria({
      id_admin_actor_nk: null,
      accio_nk: 'CREACIO_ADMINISTRADOR',
      id_objectiu_nk: nouAdmin.id_admin_nk,
      taula_objectiu_nk: 'taula_admins_nk',
      valor_nou_nk: JSON.stringify(nouAdmin)
    });

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
      message: "Error intern del servidor.",
      error: error.message
    });
  }
}

module.exports = { registrarNouAdmin };