// functions/index.js

import * as functions from "firebase-functions";
import cors from "cors";
import admin from "firebase-admin";
import { addAdmin } from "./src/controllers/adminController.js";
// Mantenim l'exemple anterior per si el necessites
// import { laTevaFuncio } from "./src/controllers/elTeuController.js";

admin.initializeApp();

const corsHandler = cors({origin: true});

// --- DEFINICIÓ DELS ENDPOINTS DE L'API ---

// Endpoint per afegir un nou administrador
export const apiAddAdmin = functions.region("europe-west1").https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    // Aquí podríem afegir un middleware de verificació d'autenticació en el futur
    addAdmin(req, res);
  });
});

// Exemple:
// export const elTeuEndpoint = functions.region("europe-west1").https.onRequest(...)