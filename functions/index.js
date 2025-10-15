// functions/index.js (Versión Funcional)

import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import admin from "firebase-admin";
import cors from "cors";
import db from "./src/config/db.js"; // Importamos la conexión a la BD

// Inicializa el SDK de Admin de Firebase.
admin.initializeApp();

// Establece la región para todas las funciones.
setGlobalOptions({ region: "europe-west1" });

// Crea un gestor de CORS reutilizable.
const corsHandler = cors({ origin: true });

// --- ENDPOINTS DE L'API ---

// Endpoint para añadir un nuevo administrador
export const apiAddAdmin = onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    // Verificamos que el método sea POST
    if (req.method !== "POST") {
      return res.status(405).send({ status: "error", message: "Method Not Allowed" });
    }

    try {
      const { nom, email, notes, firebase_uid } = req.body;

      // Validamos que los datos necesarios están presentes
      if (!nom || !email || !firebase_uid) {
        return res.status(400).json({ status: "error", message: "Falten dades obligatòries (nom, email, firebase_uid)." });
      }

      // Usamos los nombres de columna correctos de tu tabla (ver imagen image_201ad8.png)
      const sql = `
        INSERT INTO taula_admins_nk (nom_admin_nk, email_admin_nk, notes_admin_nk, firebase_uid_admin_nk)
        VALUES ($1, $2, $3, $4)
        RETURNING id_admin_nk;
      `;
      
      const values = [nom, email, notes || null, firebase_uid];

      const result = await db.query(sql, values);

      console.log("Administrador afegit amb èxit amb ID:", result.rows[0].id_admin_nk);
      res.status(201).json({ status: "ok", message: "Administrador afegit correctament!", adminId: result.rows[0].id_admin_nk });

    } catch (error) {
      console.error("Error en afegir l'administrador:", error);
      res.status(500).json({ status: "error", message: "Error intern del servidor.", error: error.message });
    }
  });
});

// Puedes añadir más funciones aquí si lo necesitas en el futuro.
// export const apiRegisterNewUser = onRequest(...)