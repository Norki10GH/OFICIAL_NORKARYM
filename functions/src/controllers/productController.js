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
      SELECT id_versio_nk, nom_versio_nk, data_versio_nk, readme_versio_nk
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
      SELECT id_versio_nk, nom_versio_nk, data_versio_nk
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
 * Controlador per crear una nova versió per a un producte existent.
 */
async function crearNovaVersio(req, res) {
  const { id_proj_nk } = req.params;
  const { nom_versio_nk, readme_versio_nk } = req.body;
  const idAdminActor = null; // Pendent d'implementar

  if (!id_proj_nk || !nom_versio_nk) {
    return res.status(400).json({ success: false, message: "L'ID del producte i el nom de la versió són obligatoris." });
  }

  const pool = await getDbPool();
  try {
    const readmeJson = readme_versio_nk ? JSON.stringify({ content: readme_versio_nk }) : null;
    const query = `
      INSERT INTO taula_versions_ky (id_proj_nk, nom_versio_nk, readme_versio_nk)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [id_proj_nk, nom_versio_nk, readmeJson];
    const result = await pool.query(query, values);
    const novaVersio = result.rows[0];

    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'CREACIO_NOVA_VERSIO',
      id_objectiu_nk: novaVersio.id_versio_nk,
      taula_objectiu_nk: 'taula_versions_ky',
      valor_nou_nk: JSON.stringify(novaVersio)
    });

    res.status(201).json({ success: true, message: `Versió '${nom_versio_nk}' creada correctament.`, data: novaVersio });

  } catch (error) {
    console.error("Error en crear la nova versió:", error);
    res.status(500).json({ success: false, message: "Error intern del servidor en crear la versió." });
  }
}

/**
 * Controlador per obtenir una llista detallada de tots els productes.
 */
async function obtenirProductesDetallats(req, res) {
  try {
    const pool = await getDbPool();
    const query = `
      SELECT
        p.id_proj_nk,
        p.nom_producte_proj_nk,
        p.email_producte_proj_nk,
        p.notes_producte_proj_nk,
        p.data_creacio_proj_nk,
        a.nom_admin_nk AS creador_nom,
        (SELECT COUNT(*) FROM taula_versions_ky v WHERE v.id_proj_nk = p.id_proj_nk) AS versions_count
      FROM taula_projectes_nk p
      JOIN taula_admins_nk a ON p.firebase_uid_admin_nk = a.firebase_uid_admin_nk
      ORDER BY p.data_creacio_proj_nk DESC;
    `;
    const result = await pool.query(query);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error en obtenir els productes detallats:", error);
    res.status(500).json({ success: false, message: "Error intern del servidor." });
  }
}

/**
 * Controlador per editar un producte.
 */
async function editarProducte(req, res) {
  const { id } = req.params;
  const { nom_producte_proj_nk, email_producte_proj_nk, notes_producte_proj_nk } = req.body;
  const idAdminActor = null; // Pendent d'implementar

  if (!nom_producte_proj_nk) {
    return res.status(400).json({ success: false, message: "El nom del producte és obligatori." });
  }

  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const valorAnticQuery = await client.query('SELECT * FROM taula_projectes_nk WHERE id_proj_nk = $1 FOR UPDATE', [id]);
    if (valorAnticQuery.rows.length === 0) throw new Error("No s'ha trobat el producte.");

    const updateQuery = `
      UPDATE taula_projectes_nk
      SET nom_producte_proj_nk = $1, email_producte_proj_nk = $2, notes_producte_proj_nk = $3
      WHERE id_proj_nk = $4
      RETURNING *;
    `;
    const result = await client.query(updateQuery, [nom_producte_proj_nk, email_producte_proj_nk || null, notes_producte_proj_nk || null, id]);
    const producteActualitzat = result.rows[0];

    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'EDICIO_PRODUCTE',
      id_objectiu_nk: id,
      taula_objectiu_nk: 'taula_projectes_nk',
      valor_antic_nk: JSON.stringify(valorAnticQuery.rows[0]),
      valor_nou_nk: JSON.stringify(producteActualitzat)
    }, client);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Producte actualitzat correctament.', data: producteActualitzat });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en editar el producte:", error);
    res.status(500).json({ success: false, message: error.message || "Error intern del servidor." });
  } finally {
    client.release();
  }
}

/**
 * Controlador per eliminar un producte i les seves dependències.
 */
async function eliminarProducte(req, res) {
  const { id } = req.params;
  const idAdminActor = null; // Pendent d'implementar

  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const valorAnticQuery = await client.query('SELECT * FROM taula_projectes_nk WHERE id_proj_nk = $1 FOR UPDATE', [id]);
    if (valorAnticQuery.rows.length === 0) throw new Error("No s'ha trobat el producte.");

    // Comprovació de dependències a taula_tipus_ky
    const tipusCheck = await client.query('SELECT 1 FROM taula_tipus_ky WHERE id_proj_nk = $1 LIMIT 1', [id]);
    if (tipusCheck.rows.length > 0) {
      throw new Error("No es pot eliminar. El producte està assignat a un o més usuaris.");
    }

    // Eliminar en cascada (primer versions, després producte)
    await client.query('DELETE FROM taula_versions_ky WHERE id_proj_nk = $1', [id]);
    await client.query('DELETE FROM taula_projectes_nk WHERE id_proj_nk = $1', [id]);

    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'ELIMINACIO_PRODUCTE',
      id_objectiu_nk: id,
      taula_objectiu_nk: 'taula_projectes_nk',
      valor_antic_nk: JSON.stringify(valorAnticQuery.rows[0])
    }, client);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Producte i totes les seves versions han estat eliminats.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en eliminar el producte:", error);
    res.status(500).json({ success: false, message: error.message || "Error intern del servidor." });
  } finally {
    client.release();
  }
}

/**
 * Controlador per editar una versió específica.
 */
async function editarVersio(req, res) {
  const { id_versio } = req.params;
  const { nom_versio_nk, readme_versio_nk } = req.body;
  const idAdminActor = null; // Pendent d'implementar

  if (!nom_versio_nk) {
    return res.status(400).json({ success: false, message: "El nom de la versió és obligatori." });
  }

  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const valorAnticQuery = await client.query('SELECT * FROM taula_versions_ky WHERE id_versio_nk = $1 FOR UPDATE', [id_versio]);
    if (valorAnticQuery.rows.length === 0) throw new Error("No s'ha trobat la versió.");

    const readmeJson = readme_versio_nk ? JSON.stringify({ content: readme_versio_nk }) : null;

    const updateQuery = `
      UPDATE taula_versions_ky
      SET nom_versio_nk = $1, readme_versio_nk = $2
      WHERE id_versio_nk = $3
      RETURNING *;
    `;
    const result = await client.query(updateQuery, [nom_versio_nk, readmeJson, id_versio]);
    const versioActualitzada = result.rows[0];

    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'EDICIO_VERSIO',
      id_objectiu_nk: id_versio,
      taula_objectiu_nk: 'taula_versions_ky',
      valor_antic_nk: JSON.stringify(valorAnticQuery.rows[0]),
      valor_nou_nk: JSON.stringify(versioActualitzada)
    }, client);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Versió actualitzada correctament.', data: versioActualitzada });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en editar la versió:", error);
    res.status(500).json({ success: false, message: error.message || "Error intern del servidor." });
  } finally {
    client.release();
  }
}

/**
 * Controlador per eliminar una versió específica.
 */
async function eliminarVersio(req, res) {
  const { id_versio } = req.params;
  const idAdminActor = null; // Pendent d'implementar

  const pool = await getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const valorAnticQuery = await client.query('SELECT * FROM taula_versions_ky WHERE id_versio_nk = $1 FOR UPDATE', [id_versio]);
    if (valorAnticQuery.rows.length === 0) throw new Error("No s'ha trobat la versió.");

    // Comprovar si la versió està en ús a taula_tipus_ky
    const tipusCheck = await client.query('SELECT 1 FROM taula_tipus_ky WHERE id_versio_nk = $1 LIMIT 1', [id_versio]);
    if (tipusCheck.rows.length > 0) {
      throw new Error("No es pot eliminar. La versió està assignada a un o més usuaris.");
    }

    await client.query('DELETE FROM taula_versions_ky WHERE id_versio_nk = $1', [id_versio]);

    await registrarAuditoria({
      id_admin_actor_nk: idAdminActor,
      accio_nk: 'ELIMINACIO_VERSIO',
      id_objectiu_nk: id_versio,
      taula_objectiu_nk: 'taula_versions_ky',
      valor_antic_nk: JSON.stringify(valorAnticQuery.rows[0])
    }, client);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Versió eliminada correctament.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en eliminar la versió:", error);
    res.status(500).json({ success: false, message: error.message || "Error intern del servidor." });
  } finally {
    client.release();
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

module.exports = {
  registrarNouProducte,
  obtenirProductes,
  obtenirVersionsPerProducte,
  assignarProducteAUsuari,
  obtenirProductesDetallats,
  editarProducte,
  eliminarProducte,
  crearNovaVersio,
  editarVersio,
  eliminarVersio
};