// functions/src/controllers/auditController.js

const { getDbPool } = require('../config/db.js');

/**
 * Controlador per obtenir tots els registres d'auditoria.
 * @param {object} req - Objecte de la petició (request).
 * @param {object} res - Objecte de la resposta (response).
 */
async function obtenirRegistresAuditoria(req, res) {
  const limit = parseInt(req.query.limit, 10) || 25;
  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * limit;

  try {
    const pool = await getDbPool();
    
    // Consulta per obtenir els registres paginats
    const dataQuery = `
      SELECT id_log_nk, id_admin_nk, accio_nk, id_objectiu_nk, taula_objectiu_nk, valor_antic_nk, valor_nou_nk, data_accio_nk
      FROM taula_auditoria_nk
      ORDER BY data_accio_nk DESC
      LIMIT $1 OFFSET $2;
    `;
    const dataResult = await pool.query(dataQuery, [limit, offset]);

    // Consulta per obtenir el total de registres
    const countQuery = 'SELECT COUNT(*) FROM taula_auditoria_nk;';
    const countResult = await pool.query(countQuery);
    const totalRecords = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalRecords: totalRecords,
        limit: limit
      }
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

module.exports = { obtenirRegistresAuditoria };