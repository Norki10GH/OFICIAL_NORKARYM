// functions/index.js
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { apiApp } = require("./src/api"); // Importem la nostra app d'API

// Inicialitzem Firebase Admin
admin.initializeApp();

// Exportem l'app principal d'Express com la nostra Cloud Function.
// El nom "api" aquí ha de coincidir amb el de firebase.json
exports.api = onRequest({ region: "europe-west1" }, apiApp);
