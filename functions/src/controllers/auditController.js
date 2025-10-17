// functions/src/controllers/auditController.js

import { getDbPool } from '../config/db.js';

/**
 * Controlador per obtenir tots els registres d'auditoria.
 * @param {object} req - Objecte de la petició (request).
 * @param {object} res - Objecte de la resposta (response).
 */
async function obtenirRegistresAuditoria(req, res) {
  try {
    const pool = await getDbPool();
    const query = `
      SELECT id_log_nk, id_admin_nk, accio_nk, id_objectiu_nk, taula_objectiu_nk, valor_antic_nk, valor_nou_nk, data_accio_nk
      FROM taula_auditoria_nk
      ORDER BY data_accio_nk DESC;
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error en obtenir els registres d'auditoria:", error);
    res.status(500).json({
      success: false,
      message: "Error intern del servidor en obtenir els registres.",
      error: error.message
    });
  }
}

export { obtenirRegistresAuditoria };