// functions/index.js (Actualitzat a la sintaxi v2)

// Importacions per a les funcions de Firebase (nova sintaxi v2)
import {log} from "firebase-functions/logger";
import {onRequest} from "firebase-functions/v2/https";
import {setGlobalOptions} from "firebase-functions/v2";

import admin from "firebase-admin";
import { addAdmin } from "./src/controllers/adminController.js";
// Mantenim l'exemple anterior per si el necessites
// import { laTevaFuncio } from "./src/controllers/elTeuController.js";

// --- INICIALITZACIÓ I CONFIGURACIÓ GLOBAL ---

// Inicialitza l'SDK d'Admin de Firebase. Només es fa una vegada.
admin.initializeApp();

// Estableix la regió per a totes les funcions desplegades des d'aquest fitxer.
// És una bona pràctica per mantenir les teves funcions a prop dels teus usuaris.
setGlobalOptions({region: "europe-west1"});

// Crea un gestor de CORS que podem reutilitzar a totes les funcions HTTP.
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
