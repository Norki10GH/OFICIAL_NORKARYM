// functions/src/controllers/adminController.js

import db from "../config/db.js";

/**
 * Afegeix un nou administrador a la base de dades.
 * @param {object} req - L'objecte de sol·licitud (request).
 * @param {object} res - L'objecte de resposta (response).
 */
export const addAdmin = async (req, res) => {
  // El UID de l'usuari autenticat que fa la petició ve del middleware (que afegirem més endavant)
  // Per ara, el rebem directament del cos per a la nostra implementació inicial.
  const { nom, email, notes, firebase_uid } = req.body;

  // Validació bàsica de les dades rebudes
  if (!nom || !email || !firebase_uid) {
    return res.status(400).json({
      status: "error",
      message: "El nom, l'email i el firebase_uid són obligatoris.",
    });
  }

  try {
    const queryText = `
      INSERT INTO taula_admins_nk (firebase_uid_admin_nk, nom_admin_nk, email_admin_nk, notes_admin_nk)
      VALUES ($1, $2, $3, $4)
      RETURNING id_admin_nk, nom_admin_nk, email_admin_nk, data_creacio_admin_nk;
    `;
    const values = [firebase_uid, nom, email, notes || null];

    const { rows } = await db.query(queryText, values);

    // Enviem una resposta d'èxit amb les dades de l'administrador creat
    res.status(201).json({
      status: "ok",
      message: "Administrador afegit correctament.",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error en afegir l'administrador:", error);
    // Gestionem errors comuns com un email duplicat
    if (error.code === "23505") { // Codi d'error de PostgreSQL per a violació de clau única
      return res.status(409).json({
        status: "error",
        message: `L'email '${email}' o el Firebase UID ja existeixen.`,
      });
    }
    res.status(500).json({
      status: "error",
      message: "Error intern del servidor en intentar afegir l'administrador.",
    });
  }
};