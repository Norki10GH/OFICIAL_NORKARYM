// Contenido para el archivo: functions/index.js

import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import admin from "firebase-admin";
import cors from "cors";
import db from "./src/config/db.js";

// Inicialización de Firebase
admin.initializeApp();
setGlobalOptions({ region: "europe-west1" });

// Configuramos CORS para permitir peticiones desde cualquier origen (para desarrollo)
const corsHandler = cors({ origin: true });

/**
 * Endpoint para añadir un nuevo administrador.
 */
export const addAdmin = onRequest((req, res) => { // ¡Sin opciones de VPC!
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send({ status: "error", message: "Método no permitido." });
    }
    try {
      const { nom, email, notes, firebase_uid } = req.body;
      
      if (!nom || !email || !firebase_uid) {
        return res.status(400).json({ status: "error", message: "Faltan datos obligatorios (nom, email, firebase_uid)." });
      }

      const sql = `
        INSERT INTO taula_admins_nk (nom_admin_nk, email_admin_nk, notes_admin_nk, firebase_uid_admin_nk)
        VALUES ($1, $2, $3, $4)
        RETURNING id_admin_nk;
      `;
      const values = [nom, email, notes || null, firebase_uid];

      const result = await db.query(sql, values);

      res.status(201).json({ 
        status: "ok", 
        message: "Administrador añadido correctament!", 
        adminId: result.rows[0].id_admin_nk 
      });

    } catch (error) {
      console.error("Error en afegir l'administrador:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Error intern del servidor en afegir administrador.", 
        error: error.message 
      });
    }
  });
});

/**
 * Endpoint para registrar una nueva solicitud de usuario.
 */
export const registerNewUser = onRequest((req, res) => { // ¡Sin opciones de VPC!
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
        return res.status(405).send({ status: "error", message: "Método no permitido." });
    }
    try {
        const { dades } = req.body;
        if (!dades || !dades.nom_complet_k_reg || !dades.email_k_reg) {
            return res.status(400).json({ status: "error", message: "Falten dades obligatòries (nom i email)." });
        }
        
        const ESTAT_PENDENT_VALIDACIO = 2;

        const sql = `
            INSERT INTO taula_users_ky (
                nom_complet_k_reg, dni_cif_k_reg, email_k_reg, telefon_k_reg, 
                notes_k_reg, id_estat_k_reg, data_solicitud_k_reg
            )
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            RETURNING id_k_reg;
        `;
        
        const values = [
            dades.nom_complet_k_reg,
            dades.dni_cif_k_reg || null,
            dades.email_k_reg,
            dades.telefon_k_reg || null,
            dades.notes_k_reg || null,
            ESTAT_PENDENT_VALIDACIO
        ];

        const result = await db.query(sql, values);

        res.status(201).json({
            status: "ok",
            message: "Sol·licitud de registre enviada correctament!",
            userId: result.rows[0].id_k_reg
        });

    } catch (error) {
        console.error("Error en registrar el nou usuari:", error);
        if (error.code === '23505') { 
            return res.status(409).json({
                status: "error",
                message: "L'adreça de correu electrònic ja està registrada."
            });
        }

        res.status(500).json({
            status: "error",
            message: "Error intern del servidor en registrar usuari.",
            error: error.message
        });
    }
  });
});