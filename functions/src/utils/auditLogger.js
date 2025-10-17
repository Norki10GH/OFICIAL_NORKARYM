// functions/src/utils/auditLogger.js

const { getDbPool } = require('../config/db.js');

/**
 * Inserta un registre a la taula d'auditoria amb gestió d'errors pròpia.
 * @param {object} auditData - Dades de l'auditoria.
 * @param {number|null} auditData.id_admin_actor_nk - ID de l'admin que realitza l'acció.
 * @param {string} auditData.accio_nk - Nom de l'acció.
 * @param {number} auditData.id_objectiu_nk - ID del registre afectat.
 * @param {string} auditData.taula_objectiu_nk - Taula del registre afectat.
 * @param {string|null} [auditData.valor_antic_nk] - Valor antic (en JSON).
 * @param {string|null} [auditData.valor_nou_nk] - Valor nou (en JSON).
 * @param {object} [dbClient] - Un client de la pool de PostgreSQL (per a transaccions).
 */
async function registrarAuditoria(auditData, dbClient) {
  const { id_admin_actor_nk, accio_nk, id_objectiu_nk, taula_objectiu_nk, valor_antic_nk, valor_nou_nk } = auditData;
  
  // Si no rebem un client, n'obtenim un de la pool. Si el rebem, l'utilitzem.
  const queryRunner = dbClient || await getDbPool();

  try {
    const query = `
      INSERT INTO taula_auditoria_nk (id_admin_nk, accio_nk, id_objectiu_nk, taula_objectiu_nk, valor_antic_nk, valor_nou_nk)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;
    const values = [
        id_admin_actor_nk || null,
        accio_nk,
        id_objectiu_nk,
        taula_objectiu_nk,
        valor_antic_nk || null,
        valor_nou_nk || null
    ];
    await queryRunner.query(query, values);

  } catch (dbError) {
    console.error("ERROR CRÍTIC: No s'ha pogut guardar el registre d'auditoria.", { error: dbError, data: auditData });
    // En un cas real, podríem enviar una alerta aquí.
  }
}

module.exports = { registrarAuditoria };