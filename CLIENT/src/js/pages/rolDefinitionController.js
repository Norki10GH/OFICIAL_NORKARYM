// functions/src/controllers/rolDefinitionController.js

const { getDbPool } = require('../config/db.js');
const { registrarAuditoria } = require('../utils/auditLogger');

/**
 * Controlador per obtenir totes les definicions de rols.
 */
async function obtenirDefinicionsRols(req, res) {
  try {
    const pool = await getDbPool();
    const query = 'SELECT * FROM taula_rols_definicions_nk ORDER BY nom_rol_def_nk ASC;';
    const result = await pool.query(query);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error en obtenir les definicions de rols:", error);
    res.status(500).json({ success: false, message: "Error intern del servidor." });
  }
}

/**
 * Controlador per crear una nova definició de rol.
 */
async function crearDefinicioRol(req, res) {
  const { nom_rol_def_nk, descripcio_rol_def_nk } = req.body;
  const idAdminActor = null; // Pendent d'implementar

  if (!nom_rol_def_nk) {
    return res.status(400).json({ success: false, message: "El nom del rol és obligatori." });
  }

  try {
    const pool = await getDbPool();
    const query = `
      INSERT INTO taula_rols_definicions_nk (nom_rol_def_nk, descripcio_rol_def_nk)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await pool.query(query, [nom_rol_def_nk, descripcio_rol_def_nk || null]);
    const nouRol = result.rows[0];

    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'CREACIO_DEFINICIO_ROL',
      id_objectiu_nk: nouRol.id_rol_def_nk,
      taula_objectiu_nk: 'taula_rols_definicions_nk',
      valor_nou_nk: JSON.stringify(nouRol)
    });

    res.status(201).json({ success: true, message: 'Definició de rol creada correctament.', data: nouRol });
  } catch (error) {
    console.error("Error en crear la definició de rol:", error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: "Ja existeix una definició de rol amb aquest nom." });
    }
    res.status(500).json({ success: false, message: "Error intern del servidor." });
  }
}

/**
 * Controlador per editar una definició de rol.
 */
async function editarDefinicioRol(req, res) {
  const { id } = req.params;
  const { nom_rol_def_nk, descripcio_rol_def_nk } = req.body;
  const idAdminActor = null; // Pendent d'implementar

  if (!nom_rol_def_nk) {
    return res.status(400).json({ success: false, message: "El nom del rol és obligatori." });
  }

  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const valorAnticQuery = await client.query('SELECT * FROM taula_rols_definicions_nk WHERE id_rol_def_nk = $1 FOR UPDATE', [id]);
    if (valorAnticQuery.rows.length === 0) throw new Error("No s'ha trobat la definició de rol.");

    const updateQuery = `
      UPDATE taula_rols_definicions_nk
      SET nom_rol_def_nk = $1, descripcio_rol_def_nk = $2
      WHERE id_rol_def_nk = $3
      RETURNING *;
    `;
    const result = await client.query(updateQuery, [nom_rol_def_nk, descripcio_rol_def_nk || null, id]);
    const rolActualitzat = result.rows[0];

    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'EDICIO_DEFINICIO_ROL',
      id_objectiu_nk: id,
      taula_objectiu_nk: 'taula_rols_definicions_nk',
      valor_antic_nk: JSON.stringify(valorAnticQuery.rows[0]),
      valor_nou_nk: JSON.stringify(rolActualitzat)
    }, client);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Definició de rol actualitzada.', data: rolActualitzat });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en editar la definició de rol:", error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: "Ja existeix una definició de rol amb aquest nom." });
    }
    res.status(500).json({ success: false, message: error.message || "Error intern del servidor." });
  } finally {
    client.release();
  }
}

/**
 * Controlador per eliminar una definició de rol.
 */
async function eliminarDefinicioRol(req, res) {
  const { id } = req.params;
  const idAdminActor = null; // Pendent d'implementar

  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const valorAnticQuery = await client.query('SELECT * FROM taula_rols_definicions_nk WHERE id_rol_def_nk = $1 FOR UPDATE', [id]);
    if (valorAnticQuery.rows.length === 0) throw new Error("No s'ha trobat la definició de rol.");

    await client.query('DELETE FROM taula_rols_definicions_nk WHERE id_rol_def_nk = $1', [id]);

    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'ELIMINACIO_DEFINICIO_ROL',
      id_objectiu_nk: id,
      taula_objectiu_nk: 'taula_rols_definicions_nk',
      valor_antic_nk: JSON.stringify(valorAnticQuery.rows[0])
    }, client);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Definició de rol eliminada correctament.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en eliminar la definició de rol:", error);
    if (error.code === '23503') { // Foreign key violation
      return res.status(409).json({ success: false, message: "No es pot eliminar. Aquest rol està assignat a un o més usuaris." });
    }
    res.status(500).json({ success: false, message: error.message || "Error intern del servidor." });
  } finally {
    client.release();
  }
}

module.exports = {
  obtenirDefinicionsRols,
  crearDefinicioRol,
  editarDefinicioRol,
  eliminarDefinicioRol
};