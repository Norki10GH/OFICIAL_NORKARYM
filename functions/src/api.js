// functions/src/api.js
const express = require('express');
const cors = require('cors');
const { registrarNouAdmin } = require('./controllers/adminController.js');
const { obtenirRegistresAuditoria } = require('./controllers/auditController.js');
const { obtenirAdministradors, assignarRol } = require('./controllers/rolController.js'); // <-- AFEGIT

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// --- Rutes d'Administradors ---
app.post('/registrarAdmin', registrarNouAdmin);

// --- Rutes de Rols ---
app.get('/administradors', obtenirAdministradors); // <-- NOU ENDPOINT
app.post('/assignarRol', assignarRol);             // <-- NOU ENDPOINT

// --- Rutes d'Auditoria ---
app.get('/audit-logs', obtenirRegistresAuditoria);

module.exports = app;