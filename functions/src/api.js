// functions/src/api.js

import express from "express";
import cors from "cors";
import { addAdmin } from "./controllers/adminController.js";
import { registerNewUser }from "./controllers/userController.js";

// Creem l'aplicació Express
const app = express();

// --- MIDDLEWARE ESSENCIAL ---

// 1. Habilitem CORS per a totes les rutes.
//    Això permet que el nostre frontend (Vite) es comuniqui amb l'API
//    durant el desenvolupament i també en producció.
app.use(cors({ origin: true }));

// 2. Habilitem el parsing de JSON.
//    Això permet que l'API entengui les dades enviades en format JSON
//    al 'body' de les peticions (com les del nostre formulari).
app.use(express.json());

// --- DEFINICIÓ DE LES RUTES DE L'API ---

// Ruta per afegir un nou administrador
// Mètode: POST
// Endpoint: /api/addAdmin
app.post("/addAdmin", addAdmin);

// Ruta per registrar una nova sol·licitud d'usuari
// Mètode: POST
// Endpoint: /api/registerNewUser
app.post("/registerNewUser", registerNewUser);

// --- GESTIÓ D'ERRORS I RUTES NO TROBADES ---

// Middleware per a rutes no trobades (Error 404)
// Si cap de les rutes anteriors coincideix, s'executarà aquest middleware.
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no trobada.",
    path: req.originalUrl,
  });
});

// Middleware per a la gestió d'errors interns (Error 500)
// Si hi ha un error en algun dels controladors, Express el capturarà aquí.
app.use((err, req, res, next) => {
  console.error("Error no controlat a l'API:", err);
  res.status(500).json({
    status: "error",
    message: "Error intern del servidor.",
    // Opcional: només mostrar detalls de l'error en entorns de desenvolupament
    // error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


// Exportem l'aplicació Express per a ser utilitzada per Firebase Functions
export default app;
