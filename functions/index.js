// functions/index.js (Actualitzat a la sintaxi v2)

// Importacions per a les funcions de Firebase (nova sintaxi v2)
import {log} from "firebase-functions/logger";
import {onRequest} from "firebase-functions/v2/https";
import {setGlobalOptions} from "firebase-functions/v2";

import admin from "firebase-admin";
import cors from "cors";

// --- INICIALITZACIÓ I CONFIGURACIÓ GLOBAL ---

// Inicialitza l'SDK d'Admin de Firebase. Només es fa una vegada.
admin.initializeApp();

// Estableix la regió per a totes les funcions desplegades des d'aquest fitxer.
// És una bona pràctica per mantenir les teves funcions a prop dels teus usuaris.
setGlobalOptions({region: "europe-west1"});

// Crea un gestor de CORS que podem reutilitzar a totes les funcions HTTP.
const corsHandler = cors({origin: true});


// --- DEFINICIÓ DELS ENDPOINTS DE L'API ---

/**
 * Endpoint de l'API per registrar un nou usuari.
 * Aquest endpoint actua com a porta d'entrada. La lògica de negoci
 * es delega als controladors corresponents per mantenir el codi net i modular.
 
export const apiRegisterNewUser = onRequest(async (req, res) => {
  // Envolviquem la nostra lògica amb el gestor de CORS.
  corsHandler(req, res, async () => {
    // Comprovem que la petició sigui un POST.
    if (req.method !== "POST") {
      res.status(405).send("Mètode no permès");
      return;
    }

    // En un futur, importarem el controlador i li passarem la petició.
    // import { registerNewUser } from './src/controllers/userController.js';
    // await registerNewUser(req, res);

    try {
      const dadesUsuari = req.body.dades;

      // --- LÒGICA TEMPORAL (fins a implementar el controlador) ---
      // Aquesta lògica es mourà a `functions/src/controllers/userController.js`
      log("Dades d'usuari rebudes per al registre:", dadesUsuari);

      // Enviem una resposta d'èxit.
      res.status(200).json({ status: "ok", message: "Usuari registrat correctament." });

    } catch (error) {
      log("Error en el registre d'usuari:", error);
      res.status(500).json({ status: "error", message: "No s'ha pogut completar el registre." });
    }
  });
});
*/