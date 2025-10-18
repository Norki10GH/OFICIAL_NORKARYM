// functions/src/controllers/userController.js

import db from "../config/db.js";

/**
 * Controlador per registrar una nova sol·licitud d'usuari.
 */
export const registerNewUser = async (req, res) => {
  try {
    const { dades } = req.body;

    // Validació de les dades d'entrada
    if (!dades || !dades.nom_complet_k_reg || !dades.email_k_reg) {
      return res.status(400).json({
        status: "error",
        message: "Les dades són invàlides. Es requereix 'nom_complet_k_reg' i 'email_k_reg'.",
      });
    }

    const ESTAT_PENDENT_VALIDACIO = 2; // Estat per a nous registres

    // Sentència SQL parametritzada per evitar injecció SQL
    const sql = `
      INSERT INTO taula_users_ky (
        nom_complet_k_reg, dni_cif_k_reg, email_k_reg, telefon_k_reg,
        notes_k_reg, id_estat_k_reg, data_solicitud_k_reg
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id_k_reg;
    `;

    // Valors a inserir, amb valors per defecte 'null' si no es proporcionen
    const values = [
      dades.nom_complet_k_reg,
      dades.dni_cif_k_reg || null,
      dades.email_k_reg,
      dades.telefon_k_reg || null,
      dades.notes_k_reg || null,
      ESTAT_PENDENT_VALIDACIO,
    ];

    // Executem la consulta a la base de dades
    const result = await db.query(sql, values);

    // Responem amb èxit
    res.status(201).json({
      status: "ok",
      message: "Sol·licitud de registre enviada correctament!",
      userId: result.rows[0].id_k_reg,
    });

  } catch (error) {
    console.error("Error en registrar el nou usuari:", error);

    // Gestió d'errors específics de la base de dades
    if (error.code === '23505') { // Codi per a violació de clau única (email duplicat)
      return res.status(409).json({
        status: "error",
        message: "L'adreça de correu electrònic ja està registrada.",
      });
    }

    // Error genèric del servidor
    res.status(500).json({
      status: "error",
      message: "Error intern del servidor en processar la sol·licitud.",
      // En desenvolupament, podria ser útil enviar més detalls de l'error
      // error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
