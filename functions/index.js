// functions/index.js

import functions from "firebase-functions";
import cors from "cors";
import admin from "firebase-admin";

// Importem les funcions que volem exposar des dels nostres controladors
import { registerNewUser } from "./src/controllers/adminController.js";
// import { altres funcions... } from "./src/controllers/userController.js";

admin.initializeApp();

const corsHandler = cors({ origin: true });

// --- DEFINICIÓ DELS ENDPOINTS DE L'API ---

// Endpoint per registrar un nou usuari
export const apiRegisterNewUser = functions.https.onRequest((req, res) => {
  // Envoltem la nostra funció de controlador amb el gestor de CORS
  corsHandler(req, res, () => {
    registerNewUser(req, res);
  });
});

// Aquí anirien altres endpoints en el futur
// export const apiLogin = functions.https.onRequest(...)