// functions/src/controllers/adminController.js

const { getAuth } = require('firebase-admin/auth');
const { Pool } = require('pg');
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

/**
 * Controlador per eliminar un administrador.
 */
async function eliminarAdmin(req, res) {
  const { id } = req.params;
  const idAdminActor = null; // Pendent d'implementar amb autenticació real

  if (!id) {
    return res.status(400).json({ success: false, message: "L'ID de l'administrador és obligatori." });
  }

  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obtenir el firebase_uid abans d'esborrar
    const adminInfo = await client.query('SELECT firebase_uid_admin_nk, email_admin_nk FROM taula_admins_nk WHERE id_admin_nk = $1 FOR UPDATE', [id]);
    if (adminInfo.rows.length === 0) {
      throw new Error("No s'ha trobat l'administrador a la base de dades.");
    }
    const { firebase_uid_admin_nk, email_admin_nk } = adminInfo.rows[0];

    // 2. Comprovar dependències crítiques (projectes o usuaris)
    const projectCheck = await client.query('SELECT 1 FROM taula_projectes_nk WHERE firebase_uid_admin_nk = $1 LIMIT 1', [firebase_uid_admin_nk]);
    if (projectCheck.rows.length > 0) {
      throw new Error("No es pot eliminar. L'administrador té projectes assignats.");
    }
    const userCheck = await client.query('SELECT 1 FROM taula_users_ky WHERE firebase_uid_admin_nk = $1 LIMIT 1', [firebase_uid_admin_nk]);
    if (userCheck.rows.length > 0) {
      throw new Error("No es pot eliminar. L'administrador té usuaris assignats.");
    }

    // 3. Eliminar dependències no crítiques (rols, emails)
    await client.query('DELETE FROM taula_rols_nk WHERE firebase_uid_admin_nk = $1', [firebase_uid_admin_nk]);
    await client.query('DELETE FROM taula_emails_nk WHERE firebase_uid_admin_nk = $1', [firebase_uid_admin_nk]);

    // 4. Actualitzar registres d'auditoria per desvincular l'admin
    await client.query('UPDATE taula_auditoria_nk SET id_admin_nk = NULL WHERE id_admin_nk = $1', [id]);

    // 5. Eliminar l'administrador de la taula principal
    const deleteResult = await client.query('DELETE FROM taula_admins_nk WHERE id_admin_nk = $1', [id]);
    if (deleteResult.rowCount === 0) {
      throw new Error("No s'ha pogut eliminar l'administrador de la base de dades.");
    }

    // 6. Eliminar l'usuari de Firebase Authentication
    try {
      await getAuth().deleteUser(firebase_uid_admin_nk);
    } catch (authError) {
      // Si l'usuari no existeix a Firebase Auth, no és un error fatal per a la transacció
      if (authError.code !== 'auth/user-not-found') {
        throw authError; // Llança altres errors d'autenticació
      }
      console.warn(`L'usuari amb UID ${firebase_uid_admin_nk} no s'ha trobat a Firebase Auth, però s'ha eliminat de la BD.`);
    }

    // 7. Registrar l'acció a l'auditoria
    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'ELIMINACIO_ADMINISTRADOR',
      id_objectiu_nk: id,
      taula_objectiu_nk: 'taula_admins_nk',
      valor_nou_nk: JSON.stringify({ email_eliminat: email_admin_nk })
    }, client);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Administrador eliminat correctament.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en eliminar l'administrador:", error);
    res.status(500).json({ success: false, message: error.message || "Error intern del servidor." });
  } finally {
    client.release();
  }
}

/**
 * Controlador per editar les dades d'un administrador.
 */
async function editarAdmin(req, res) {
  const { id } = req.params;
  const { nom_admin_nk, email_admin_nk, notes_admin_nk } = req.body;
  const idAdminActor = null; // Pendent d'implementar amb autenticació real

  if (!id) {
    return res.status(400).json({ success: false, message: "L'ID de l'administrador és obligatori." });
  }
  if (!nom_admin_nk || !email_admin_nk) {
    return res.status(400).json({ success: false, message: "El nom i l'email són obligatoris." });
  }

  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obtenir dades actuals per a l'auditoria i per actualitzar Firebase
    const adminInfoQuery = await client.query('SELECT firebase_uid_admin_nk, nom_admin_nk, email_admin_nk FROM taula_admins_nk WHERE id_admin_nk = $1 FOR UPDATE', [id]);
    if (adminInfoQuery.rows.length === 0) {
      throw new Error("No s'ha trobat l'administrador a la base de dades.");
    }
    const adminActual = adminInfoQuery.rows[0];
    const { firebase_uid_admin_nk } = adminActual;

    // 2. Actualitzar la base de dades PostgreSQL
    const updateQuery = `
      UPDATE taula_admins_nk
      SET nom_admin_nk = $1, email_admin_nk = $2, notes_admin_nk = $3
      WHERE id_admin_nk = $4
      RETURNING *;
    `;
    const values = [nom_admin_nk, email_admin_nk, notes_admin_nk || null, id];
    const updateResult = await client.query(updateQuery, values);
    const adminActualitzat = updateResult.rows[0];

    // 3. Actualitzar dades a Firebase Authentication (si han canviat)
    const updates = {};
    if (adminActual.nom_admin_nk !== nom_admin_nk) {
      updates.displayName = nom_admin_nk;
    }
    if (adminActual.email_admin_nk !== email_admin_nk) {
      updates.email = email_admin_nk;
    }

    if (Object.keys(updates).length > 0) {
      await getAuth().updateUser(firebase_uid_admin_nk, updates);
    }

    // 4. Registrar l'acció a l'auditoria
    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'EDICIO_ADMINISTRADOR',
      id_objectiu_nk: id,
      taula_objectiu_nk: 'taula_admins_nk',
      valor_antic_nk: JSON.stringify(adminActual),
      valor_nou_nk: JSON.stringify(adminActualitzat)
    }, client);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Administrador actualitzat correctament.', data: adminActualitzat });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en editar l'administrador:", error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ success: false, message: "L'adreça d'email ja està en ús per un altre compte." });
    }
    if (error.code === '23505') { // Unique violation a PostgreSQL
      return res.status(409).json({ success: false, message: "L'adreça d'email ja existeix a la base de dades." });
    }
    res.status(500).json({ success: false, message: error.message || "Error intern del servidor." });
  } finally {
    client.release();
  }
}

module.exports = { registrarNouAdmin, eliminarAdmin, editarAdmin };