// functions/index.js

import * as functions from "firebase-functions";
import cors from "cors";
import admin from "firebase-admin";
// import { laTevaFuncio } from "./src/controllers/elTeuController.js";

admin.initializeApp();

const corsHandler = cors({origin: true});

// --- DEFINICIÓ DELS ENDPOINTS DE L'API ---
// Aquí aniran els endpoints que creeu en el futur.
// Exemple:
// export const elTeuEndpoint = functions.region("europe-west1").https.onRequest(...)
