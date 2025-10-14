// functions/index.js (Corregido)

import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import admin from "firebase-admin";
import cors from "cors";

import { addAdmin } from "./src/controllers/adminController.js";
import { registerNewUser } from "./src/controllers/userController.js";

// Inicializa l'SDK d'Admin de Firebase.
admin.initializeApp();

// Establece la región para todas las funciones.
setGlobalOptions({ region: "europe-west1" });

// Crea un gestor de CORS reutilizable.
const corsHandler = cors({ origin: true });

// --- ENDPOINTS DE L'API ---

// Endpoint para añadir un nuevo administrador
export const apiAddAdmin = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    await addAdmin(req, res);
  });
});

// Endpoint para registrar un nuevo usuario
export const apiRegisterNewUser = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    await registerNewUser(req, res);
  });
});