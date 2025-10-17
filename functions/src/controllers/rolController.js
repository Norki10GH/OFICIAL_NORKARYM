// functions/src/controllers/rolController.js

const { getDbPool } = require('../config/db.js');
const { registrarAuditoria } = require('../utils/auditLogger');

async function assignarRol(req, res) {
  const idAdminActor = null; 
  
  const { firebase_uid_admin_nk, nom_rol_nk, notes_rol_nk } = req.body;

  if (!firebase_uid_admin_nk || !nom_rol_nk) {
    return res.status(400).json({
      success: false,
      message: "L'UID de l'administrador i el nom del rol són obligatoris."
    });
  }

  const pool = await getDbPool();
  try {
    const adminResult = await pool.query('SELECT email_admin_nk FROM taula_admins_nk WHERE firebase_uid_admin_nk = $1', [firebase_uid_admin_nk]);
    if (adminResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "L'administrador seleccionat no existeix." });
    }
    const { email_admin_nk: adminEmail } = adminResult.rows[0];

    const query = `
      INSERT INTO taula_rols_nk (firebase_uid_admin_nk, nom_rol_nk, email_rols_nk, notes_rol_nk)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [firebase_uid_admin_nk, nom_rol_nk, adminEmail, notes_rol_nk || null];
    
    const result = await pool.query(query, values);
    const nouRol = result.rows[0];

    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'ASSIGNACIO_ROL_ADMIN',
      id_objectiu_nk: nouRol.id_rol_nk,
      taula_objectiu_nk: 'taula_rols_nk',
      valor_nou_nk: JSON.stringify(nouRol)
    });

    res.status(201).json({
      success: true,
      message: `Rol '${nom_rol_nk}' assignat correctament.`,
      data: nouRol
    });

  } catch (error) {
    console.error("Error en assignar el rol:", error);
    if (error.code === '23505') { 
        return res.status(409).json({ success: false, message: "Aquest administrador ja té aquest rol assignat." });
    }
    res.status(500).json({ success: false, message: "Error intern del servidor." });
  }
}

async function eliminarRol(req, res) {
  const { id } = req.params; 
  const idAdminActor = null; 

  if (!id) {
    return res.status(400).json({ success: false, message: "L'ID del rol és obligatori." });
  }

  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const rolInfoQuery = await client.query('SELECT * FROM taula_rols_nk WHERE id_rol_nk = $1 FOR UPDATE', [id]);
    if (rolInfoQuery.rows.length === 0) {
      throw new Error("No s'ha trobat el rol a eliminar.");
    }
    const rolEliminat = rolInfoQuery.rows[0];

    await client.query('DELETE FROM taula_rols_nk WHERE id_rol_nk = $1', [id]);

    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'ELIMINACIO_ROL_ADMIN',
      id_objectiu_nk: id,
      taula_objectiu_nk: 'taula_rols_nk',
      valor_antic_nk: JSON.stringify(rolEliminat)
    }, client);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Rol eliminat correctament.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en eliminar el rol:", error);
    res.status(500).json({ success: false, message: error.message || "Error intern del servidor." });
  } finally {
    client.release();
  }
}

module.exports = {
  assignarRol,
  eliminarRol
};