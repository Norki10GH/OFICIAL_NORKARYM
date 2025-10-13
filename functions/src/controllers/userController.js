// functions/src/controllers/userController.js

import db from "../config/db.js";
import admin from "firebase-admin"; // Importem l'SDK d'Admin per accedir a Firestore

export const registerNewUser = async (req, res) => {
  const { dades } = req.body;

  if (!dades || !dades.email || !dades.nom || !dades.cognoms) {
    return res.status(400).json({
      status: "error",
      message: "Falten dades obligatòries per al registre.",
    });
  }

  // ---> PAS 1: Inserció a la base de dades PostgreSQL (com abans)
  try {
    const queryText = `
      INSERT INTO taula_users_ky (
        email_k_reg, nom_complet_k_reg, dni_cif_k_reg, telefon_k_reg,
        domicili_k_reg, poblacio_k_reg, cp_k_reg, pais_k_reg,
        notes_k_reg, data_solicitud_k_reg, id_estat_k_reg
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
      RETURNING id_k_reg, email_k_reg, data_solicitud_k_reg;
    `;

    const nomComplet = `${dades.nom} ${dades.cognoms}`.trim();
    const ESTAT_PENDENT = 2; // Assumim que '2' és l'ID per a 'PENDENT VALIDACIO'

    const values = [
      dades.email, nomComplet, dades.dni, dades.telefon,
      dades.adreca, dades.poblacio, dades.codiPostal, dades.pais,
      dades.comentaris || null, ESTAT_PENDENT,
    ];

    const { rows } = await db.query(queryText, values);
    const nouUsuari = rows[0];

    // ---> PAS 2: Preparar i enviar l'email a través de Firestore
    try {
      const dbFirestore = admin.firestore();
      const emailsAdmins = ["arym10@norkarym.com", "norki10@norkarym.com", "admins@norkarym.com"];
      const urlZonaAdmins = "https://norkarym.web.app/src/pages/administradors.html"; // URL de producció

      // Creem el cos del correu amb les dades rebudes
      const emailHtml = `
        <h1>Nova Sol·licitud d'Inscripció a NORKÄRŸM</h1>
        <p>S'ha rebut una nova sol·licitud d'inscripció amb les següents dades:</p>
        <ul>
          <li><strong>Nom Complet:</strong> ${nomComplet}</li>
          <li><strong>Email:</strong> ${dades.email}</li>
          <li><strong>Telèfon:</strong> ${dades.telefon}</li>
          <li><strong>DNI/CIF:</strong> ${dades.dni}</li>
          <li><strong>Adreça:</strong> ${dades.adreca}, ${dades.codiPostal}, ${dades.poblacio}, ${dades.pais}</li>
          <li><strong>Comentaris:</strong> ${dades.comentaris || "Cap"}</li>
        </ul>
        <p>Pots gestionar les sol·licituds a la zona d'administració:</p>
        <a href="${urlZonaAdmins}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Anar a la Zona d'Administradors
        </a>
      `;

      // Document que llegirà l'extensió "Trigger Email"
      const mailDocument = {
        to: emailsAdmins,
        message: {
          subject: "Nova Sol·licitud d'Inscripció a NORKÄRŸM",
          html: emailHtml,
        },
      };

      // Afegim el document a la col·lecció 'mail'
      await dbFirestore.collection("mail").add(mailDocument);

    } catch (emailError) {
      console.error("Error en desar el document de correu a Firestore:", emailError);
      // Important: No aturem l'operació si només falla l'email. L'usuari ja està registrat.
      // Podem afegir un sistema de logs més avançat aquí en el futur.
    }

    // Resposta final d'èxit
    res.status(201).json({
      status: "ok",
      message: "Sol·licitud d'inscripció rebuda correctament.",
      data: nouUsuari,
    });

  } catch (dbError) {
    console.error("Error en registrar el nou usuari a PostgreSQL:", dbError);
    if (dbError.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: `L'email '${dades.email}' ja està registrat.`,
      });
    }
    res.status(500).json({
      status: "error",
      message: "Error intern del servidor en processar la inscripció.",
    });
  }
};