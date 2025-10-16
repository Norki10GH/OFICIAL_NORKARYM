// functions/src/controllers/adminController.js

import pool from "../config/db.js";

// Funció per afegir un nou administrador
export const addAdmin = async (req, res) => {
  const { firebase_uid, nom, email, notes } = req.body;

  if (!firebase_uid || !nom || !email) {
    return res.status(400).send("Els camps firebase_uid, nom i email són obligatoris.");
  }

  try {
    const result = await pool.query(
      "INSERT INTO taula_admins_nk (firebase_uid_admin_nk, nom_admin_nk, email_admin_nk, notes_admin_nk) VALUES ($1, $2, $3, $4) RETURNING *",
      [firebase_uid, nom, email, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error en afegir l'administrador:", error);
    res.status(500).send("Error intern del servidor en afegir l'administrador.");
  }
};
