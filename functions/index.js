// functions/index.js

import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import admin from "firebase-admin";
import api from "./src/api.js"; // Importem l'app d'Express

// --- INICIALITZACIÓ GLOBAL ---

// Inicialitzem l'SDK d'Admin de Firebase.
// Això només s'ha de fer una vegada per a tota l'aplicació.
admin.initializeApp();

// Establim opcions globals per a totes les funcions.
// En aquest cas, definim la regió on s'executaran les funcions.
setGlobalOptions({ region: "europe-west1" });


// --- EXPORTACIÓ DE L'API ---

// Creem una única Cloud Function que servirà tota la nostra API d'Express.
// Qualsevol petició que arribi a '/api' (configurat a firebase.json)
// serà gestionada per la nostra aplicació 'api'.
//
// Per exemple:
// - Una petició a '.../api/addAdmin' serà gestionada per 'app.post("/addAdmin", ...)'
// - Una petició a '.../api/registerNewUser' serà gestionada per 'app.post("/registerNewUser", ...)'
export const api_norkarym = onRequest(api);
