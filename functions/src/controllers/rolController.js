// functions/src/controllers/rolController.js

const { getDbPool } = require('../config/db.js');
const { registrarAuditoria } = require('../utils/auditLogger'); // Crearem aquest mòdul de seguida

/**
 * Controlador per obtenir tots els administradors.
 * Retorna una llista d'administradors per poblar un selector.
 */
async function obtenirAdministradors(req, res) {
  try {
    const pool = await getDbPool();
    const query = `
      SELECT
        a.id_admin_nk,
        a.nom_admin_nk,
        a.email_admin_nk,
        a.data_creacio_admin_nk,
        a.notes_admin_nk,
        COALESCE(
          (SELECT json_agg(json_build_object('id_rol_nk', r.id_rol_nk, 'nom_rol_nk', r.nom_rol_nk)) FROM taula_rols_nk r WHERE r.firebase_uid_admin_nk = a.firebase_uid_admin_nk),
          '[]'::json
        ) AS rols
      FROM taula_admins_nk a
      LEFT JOIN taula_rols_nk r ON a.firebase_uid_admin_nk = r.firebase_uid_admin_nk
      GROUP BY a.id_admin_nk
      ORDER BY a.nom_admin_nk ASC;
    `;
    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error en obtenir els administradors:", error && error.stack ? error.stack : error);
    res.status(500).json({
      success: false,
      message: "Error intern del servidor en obtenir els administradors."
    });
  }
}

/**
 * Controlador per assignar un rol a un administrador.
 */
async function assignarRol(req, res) {
  // Suposem que l'ID de l'admin que fa l'acció ve en el token (ho implementarem més endavant)
  // Per ara, ho deixem com a 'sistema'
  const idAdminActor = null; 
  
  const { id_admin_nk, nom_rol_nk, notes_rol_nk } = req.body;

  if (!id_admin_nk || !nom_rol_nk) {
    return res.status(400).json({
      success: false,
      message: "L'ID de l'administrador i el nom del rol són obligatoris."
    });
  }

  const pool = await getDbPool();
  try {
    // Comprovem si l'admin existeix per obtenir el seu email i firebase_uid
    const adminResult = await pool.query('SELECT firebase_uid_admin_nk, email_admin_nk FROM taula_admins_nk WHERE id_admin_nk = $1', [id_admin_nk]);
    if (adminResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "L'administrador seleccionat no existeix." });
    }
    const { firebase_uid_admin_nk, email_admin_nk: adminEmail } = adminResult.rows[0];

    const query = `
      INSERT INTO taula_rols_nk (firebase_uid_admin_nk, nom_rol_nk, email_rols_nk, notes_rol_nk)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [firebase_uid_admin_nk, nom_rol_nk, adminEmail, notes_rol_nk || null];
    
    const result = await pool.query(query, values);
    const nouRol = result.rows[0];

    // Registrar a l'auditoria
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
    console.error("Error en assignar el rol:", error && error.stack ? error.stack : error);
    // Gestionem l'error de clau única per a l'email si ja existeix un rol amb aquest email
    if (error.code === '23505') { // Codi d'error de PostgreSQL per a 'unique_violation'
        return res.status(409).json({ success: false, message: "Aquest administrador ja té un rol assignat amb un email que ha d'ésser únic." });
    }
    res.status(500).json({ success: false, message: "Error intern del servidor." });
  }
}

/**
 * Controlador per eliminar un rol assignat a un administrador.
 */
async function eliminarRol(req, res) {
  const { id } = req.params; // id_rol_nk
  const idAdminActor = null; // Pendent d'implementar amb autenticació real

  if (!id) {
    return res.status(400).json({ success: false, message: "L'ID del rol és obligatori." });
  }

  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obtenir les dades del rol abans d'esborrar-lo per a l'auditoria
    const rolInfoQuery = await client.query('SELECT * FROM taula_rols_nk WHERE id_rol_nk = $1 FOR UPDATE', [id]);
    if (rolInfoQuery.rows.length === 0) {
      throw new Error("No s'ha trobat el rol a eliminar.");
    }
    const rolEliminat = rolInfoQuery.rows[0];

    // 2. Eliminar el rol
    await client.query('DELETE FROM taula_rols_nk WHERE id_rol_nk = $1', [id]);

    // 3. Registrar l'acció a l'auditoria
    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'ELIMINACIO_ROL_ADMIN',
      id_objectiu_nk: id,
      taula_objectiu_nk: 'taula_rols_nk',
      valor_antic_nk: JSON.stringify(rolEliminat) // Guardem el rol eliminat
    }, client);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Rol eliminat correctament.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en eliminar el rol:", error && error.stack ? error.stack : error);
    res.status(500).json({ success: false, message: error.message || "Error intern del servidor." });
  } finally {
    client.release();
  }
}

module.exports = {
  obtenirAdministradors,
  assignarRol,
  eliminarRol
};