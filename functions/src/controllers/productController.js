// functions/src/controllers/productController.js

const { getDbPool } = require('../config/db.js');
const { registrarAuditoria } = require('../utils/auditLogger');

/**
 * Controlador per registrar un nou producte o projecte.
 */
async function registrarNouProducte(req, res) {
  // Suposem que l'ID de l'admin que fa l'acció ve en el token (ho implementarem més endavant)
  // Per ara, ho deixem com a 'sistema'
  const idAdminActor = null;

  const { 
    firebase_uid_admin_nk, 
    nom_producte_proj_nk, 
    email_producte_proj_nk, 
    notes_producte_proj_nk,
    nom_versio_nk,
    readme_versio_nk,
    // El camp 'notes_versio_nk' no està al formulari, però el preparem per si es vol afegir.
    notes_versio_nk 
  } = req.body;

  if (!firebase_uid_admin_nk || !nom_producte_proj_nk || !nom_versio_nk) {
    return res.status(400).json({
      success: false,
      message: "L'ID de l'administrador, el nom del producte i el nom de la versió inicial són obligatoris."
    });
  }

  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Iniciem la transacció

    // 1. Inserir el projecte
    const projectQuery = `
      INSERT INTO taula_projectes_nk (firebase_uid_admin_nk, nom_producte_proj_nk, email_producte_proj_nk, notes_producte_proj_nk)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const projectValues = [firebase_uid_admin_nk, nom_producte_proj_nk, email_producte_proj_nk || null, notes_producte_proj_nk || null];
    const projectResult = await client.query(projectQuery, projectValues);
    const nouProducte = projectResult.rows[0];

    // Registrar el projecte a l'auditoria
    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'REGISTRE_PRODUCTE',
      id_objectiu_nk: nouProducte.id_proj_nk,
      taula_objectiu_nk: 'taula_projectes_nk',
      valor_nou_nk: JSON.stringify(nouProducte)
    }, client); // Passem el 'client' de la transacció

    // 2. Inserir la versió inicial
    const readmeJson = readme_versio_nk ? JSON.stringify({ content: readme_versio_nk }) : null;
    const versionQuery = `
      INSERT INTO taula_versions_ky (id_proj_nk, nom_versio_nk, readme_versio_nk, notes_versio_nk)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const versionValues = [nouProducte.id_proj_nk, nom_versio_nk, readmeJson, notes_versio_nk || null];
    const versionResult = await client.query(versionQuery, versionValues);
    const novaVersio = versionResult.rows[0];

    // Registrar la versió a l'auditoria
    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'CREACIO_VERSIO_INICIAL',
      id_objectiu_nk: novaVersio.id_versio_nk,
      taula_objectiu_nk: 'taula_versions_ky',
      valor_nou_nk: JSON.stringify(novaVersio)
    }, client); // Passem el 'client' de la transacció

    await client.query('COMMIT'); // Confirmem la transacció

    res.status(201).json({
      success: true,
      message: `Producte '${nom_producte_proj_nk}' i la seva versió inicial '${nom_versio_nk}' s'han registrat correctament.`,
      data: { producte: nouProducte, versio: novaVersio }
    });

  } catch (error) {
    await client.query('ROLLBACK'); // Desfem tots els canvis si hi ha un error
    console.error("Error en registrar el producte/projecte:", error);
    res.status(500).json({ success: false, message: "Error intern del servidor en registrar el producte/projecte." });
  } finally {
    client.release(); // Alliberem el client de la pool
  }
}

/**
 * Controlador per obtenir tots els productes/projectes.
 */
async function obtenirProductes(req, res) {
  try {
    const pool = await getDbPool();
    const query = `
      SELECT id_proj_nk, nom_producte_proj_nk
      FROM taula_projectes_nk
      ORDER BY nom_producte_proj_nk ASC;
    `;
    const result = await pool.query(query);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error en obtenir els productes:", error);
    res.status(500).json({ success: false, message: "Error intern del servidor en obtenir els productes." });
  }
}

/**
 * Controlador per obtenir les versions d'un producte/projecte específic.
 */
async function obtenirVersionsPerProducte(req, res) {
  const { id_proj_nk } = req.params;
  if (!id_proj_nk) {
    return res.status(400).json({ success: false, message: "L'ID del projecte és obligatori." });
  }

  try {
    const pool = await getDbPool();
    const query = `
      SELECT id_versio_nk, nom_versio_nk
      FROM taula_versions_ky
      WHERE id_proj_nk = $1
      ORDER BY data_versio_nk DESC;
    `;
    const result = await pool.query(query, [id_proj_nk]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error(`Error en obtenir les versions per al projecte ${id_proj_nk}:`, error);
    res.status(500).json({ success: false, message: "Error intern del servidor en obtenir les versions." });
  }
}

/**
 * Controlador per assignar un producte/versió a un usuari (crea un 'tipus').
 */
async function assignarProducteAUsuari(req, res) {
  const idAdminActor = null; // Pendent d'implementar amb autenticació

  const { id_proj_nk, id_versio_nk, email_tipus_k, codi_tipus_k, descripcio_tipus_k } = req.body;

  if (!id_proj_nk || !id_versio_nk || !email_tipus_k || !codi_tipus_k) {
    return res.status(400).json({
      success: false,
      message: "El producte, la versió, l'email i el codi són obligatoris."
    });
  }

  const pool = await getDbPool();
  try {
    const query = `
      INSERT INTO taula_tipus_ky (id_proj_nk, id_versio_nk, email_tipus_k, codi_tipus_k, descripcio_tipus_k)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [id_proj_nk, id_versio_nk, email_tipus_k, codi_tipus_k, descripcio_tipus_k || null];
    const result = await pool.query(query, values);
    const nouTipus = result.rows[0];

    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'ASSIGNACIO_PRODUCTE_USUARI',
      id_objectiu_nk: nouTipus.id_tipus_k,
      taula_objectiu_nk: 'taula_tipus_ky',
      valor_nou_nk: JSON.stringify(nouTipus)
    });

    res.status(201).json({
      success: true,
      message: `Producte assignat correctament a l'email '${email_tipus_k}'.`,
      data: nouTipus
    });

  } catch (error) {
    console.error("Error en assignar el producte a l'usuari:", error);
    if (error.code === '23505') { // Error de clau única (email_tipus_k)
      return res.status(409).json({ success: false, message: "Aquest email ja té un tipus de producte assignat." });
    }
    res.status(500).json({ success: false, message: "Error intern del servidor en realitzar l'assignació." });
  }
}

module.exports = { registrarNouProducte, obtenirProductes, obtenirVersionsPerProducte, assignarProducteAUsuari };