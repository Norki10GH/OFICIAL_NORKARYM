// functions/index.js

import * as functions from "firebase-functions";
import cors from "cors";
import admin from "firebase-admin";

// Importem les funcions que volem exposar des dels nostres controladors
import {registerNewUser} from "./src/controllers/adminController.js";
// import { altres funcions... } from "./src/controllers/userController.js";

admin.initializeApp();

const corsHandler = cors({origin: true});

// --- DEFINICIÓ DELS ENDPOINTS DE L'API ---

// Endpoint per registrar un nou usuari
export const apiRegisterNewUser = functions.region("europe-west1").https.onRequest(async (req, res) => {
  // Envoltem la nostra funció de controlador amb el gestor de CORS
  corsHandler(req, res, async () => {
    try {
      await registerNewUser(req, res);
    } catch (error) {
      console.error("Error no controlat a l'endpoint apiRegisterNewUser:", error);
      res.status(500).send("Error intern del servidor.");
    }
  });
});

// Aquí anirien altres endpoints en el futur
// export const apiLogin = functions.https.onRequest(...)
