
// Importa l'SDK d'Admin de Firebase per interactuar amb els serveis de Firebase
import admin from "firebase-admin";

// Inicialitza l'SDK d'Admin. Aquesta crida única configura l'entorn
// perquè les funcions puguin autenticar-se i realitzar accions amb privilegis.
admin.initializeApp();

// Per configurar les variables d'entorn, executa les següents comandes a la
// terminal:
// firebase functions:config:set norkarym.admin_code="EL_TEU_CODI"
// firebase functions:config:set norkarym.spreadsheet_id="L_ID_DEL_TEU_SPREADSHEET"
// firebase functions:config:set norkarym.template_id="L_ID_DE_LA_TEVA_PLANTILLA"
// firebase functions:config:set norkarym.admin_emails="email1@admin.com"

import functions from "firebase-functions";
import cors from "cors";
import * as adminController from "./src/controllers/adminController.js";
import * as userController from "./src/controllers/userController.js";

const corsHandler = cors({origin: true});

// Admin functions
export const getNewUsers = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    adminController.getNewUsers(req, res);
  });
});

export const updateUser = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    adminController.updateNewUser(req, res);
  });
});

export const registerNewUser = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    adminController.registerNewUser(req, res);
  });
});

export const getUsersSummary = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    adminController.getUsersSummary(req, res);
  });
});

// User functions
export const processNewUser = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    userController.processNewUser(req, res);
  });
});

export const sendContactEmail = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    userController.sendContactEmail(req, res);
  });
});
