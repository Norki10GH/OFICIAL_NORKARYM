// functions/src/controllers/emailController.js

const { getDbPool } = require('../config/db.js');
const { registrarAuditoria } = require('../utils/auditLogger');

/**
 * Controlador per assignar un email a un administrador.
 */
async function assignarEmail(req, res) {
  // Suposem que l'ID de l'admin que fa l'acció ve en el token (ho implementarem més endavant)
  // Per ara, ho deixem com a 'sistema'
  const idAdminActor = null;

  const { firebase_uid_admin_nk, nom_compte_email_nk, email_email_nk, notes_email_nk } = req.body;

  if (!firebase_uid_admin_nk || !nom_compte_email_nk || !email_email_nk) {
    return res.status(400).json({
      success: false,
      message: "L'ID de l'administrador, el nom del compte i l'email són obligatoris."
    });
  }

  const pool = await getDbPool();
  try {
    const query = `
      INSERT INTO taula_emails_nk (firebase_uid_admin_nk, nom_compte_email_nk, email_email_nk, notes_email_nk)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [firebase_uid_admin_nk, nom_compte_email_nk, email_email_nk, notes_email_nk || null];

    const result = await pool.query(query, values);
    const nouEmail = result.rows[0];

    // Registrar a l'auditoria
    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'ASSIGNACIO_EMAIL_ADMIN',
      id_objectiu_nk: nouEmail.id_email_nk,
      taula_objectiu_nk: 'taula_emails_nk',
      valor_nou_nk: JSON.stringify(nouEmail)
    });

    res.status(201).json({
      success: true,
      message: `Email '${email_email_nk}' assignat correctament.`,
      data: nouEmail
    });

  } catch (error) {
    console.error("Error en assignar l'email:", error);
    // Gestionem l'error de clau única per a l'email si ja existeix
    if (error.code === '23505') { // Codi d'error de PostgreSQL per a 'unique_violation'
      return res.status(409).json({ success: false, message: "Aquesta adreça de correu electrònic ja està registrada." });
    }
    res.status(500).json({ success: false, message: "Error intern del servidor en assignar l'email." });
  }
}

module.exports = { assignarEmail };