// functions/index.js
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const api = require("./src/api");

// Inicialitzem Firebase Admin (només una vegada)
admin.initializeApp();

// Exportem l'app d'Express com una única Cloud Function
exports.api = onRequest({ region: "europe-west1" }, api);