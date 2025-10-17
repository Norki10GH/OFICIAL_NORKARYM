// functions/index.js
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const apiApp = require("./src/api"); // Importem la nostra app d'API

// Inicialitzem Firebase Admin
admin.initializeApp();

// Creem una app principal d'Express que actuarà com a enrutador
const mainApp = express();

// Aquesta és la línia clau:
// Li diem a l'app principal que totes les rutes definides a 'api.js'
// han d'estar sota el prefix '/api'.
// Ara, quan arribi una petició a /api/registrarAdmin, buscarà /registrarAdmin dins de apiApp.
mainApp.use('/api', apiApp);

// Exportem l'app principal d'Express com la nostra Cloud Function.
// El nom "api" aquí ha de coincidir amb el de firebase.json
exports.api = onRequest({ region: "europe-west1" }, mainApp);