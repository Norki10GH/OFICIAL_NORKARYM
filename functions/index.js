// functions/index.js (Versió Corregida i Ampliada)

import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import admin from "firebase-admin";
import cors from "cors";
import db from "./src/config/db.js";

// Inicialització de Firebase
admin.initializeApp();
setGlobalOptions({ region: "europe-west1" });

// Configuració del CORS per permetre peticions des del frontend
const corsHandler = cors({ origin: true });

/**
 * Endpoint per afegir un nou administrador a la taula taula_admins_nk.
 * Rep les dades des del formulari del panell d'administració.
 */
export const addAdmin = onRequest(async (req, res) => { // CORRECCIÓ: Renombrada de 'apiAddAdmin' a 'addAdmin'
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send({ status: "error", message: "Mètode no permès." });
    }
    try {
      const { nom, email, notes, firebase_uid } = req.body;
      
      if (!nom || !email || !firebase_uid) {
        return res.status(400).json({ status: "error", message: "Falten dades obligatòries (nom, email, firebase_uid)." });
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
        message: "Administrador afegit correctament!", 
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
 * NOU ENDPOINT: Endpoint per registrar una nova sol·licitud d'usuari a la taula taula_users_ky.
 * Rep les dades des del formulari d'inscripció públic.
 */
export const registerNewUser = onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
        return res.status(405).send({ status: "error", message: "Mètode no permès." });
    }
    try {
        // El frontend envia un objecte { dades: { ... } }
        const { dades } = req.body;
        if (!dades || !dades.nom_complet_k_reg || !dades.email_k_reg) {
            return res.status(400).json({ status: "error", message: "Falten dades obligatòries (nom i email)." });
        }
        
        // NOTA: Assumim que l'estat 'PENDENT VALIDACIO' té l'ID = 2 a la taula 'taula_estats_nk'.
        // Això s'hauria de gestionar de forma més dinàmica en el futur.
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
        // Controlem si l'error és per un email duplicat (constraint 'unique')
        if (error.code === '23505') { // Codi d'error de PostgreSQL per a violació de 'unique'
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