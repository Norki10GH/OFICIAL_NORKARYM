// functions/src/controllers/auditController.js

const { getDbPool } = require('../config/db.js');

/**
 * Controlador per obtenir tots els registres d'auditoria.
 * @param {object} req - Objecte de la petició (request).
 * @param {object} res - Objecte de la resposta (response).
 */
async function obtenirRegistresAuditoria(req, res) {
  // Obtenim el límit de la query string, amb un valor per defecte de 50.
  const limit = parseInt(req.query.limit, 10) || 50;

  try {
    const pool = await getDbPool();
    
    // Afegim la clàusula LIMIT a la consulta SQL.
    // Fem servir $1 per passar el valor de forma segura i evitar SQL injection.
    const query = `
      SELECT id_log_nk, id_admin_nk, accio_nk, id_objectiu_nk, taula_objectiu_nk, valor_antic_nk, valor_nou_nk, data_accio_nk
      FROM taula_auditoria_nk
      ORDER BY data_accio_nk DESC
      LIMIT $1;
    `;

    const values = [limit];
    const result = await pool.query(query, values);

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

module.exports = { obtenirRegistresAuditoria };