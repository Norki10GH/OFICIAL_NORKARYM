// functions/src/api.js
const express = require('express');
const cors = require('cors');
const { registrarNouAdmin } = require('./controllers/adminController.js');
const { assignarEmail } = require('./controllers/emailController.js'); // <-- AFEGIT
const { obtenirRegistresAuditoria } = require('./controllers/auditController.js');
const { registrarNouProducte, obtenirProductes, obtenirVersionsPerProducte, assignarProducteAUsuari } = require('./controllers/productController.js');
const { obtenirAdministradors, assignarRol } = require('./controllers/rolController.js'); // <-- AFEGIT

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// --- Rutes d'Administradors ---
app.post('/registrarAdmin', registrarNouAdmin);

// --- Rutes de Rols ---
app.get('/administradors', obtenirAdministradors); // <-- NOU ENDPOINT
app.post('/assignarRol', assignarRol);             // <-- NOU ENDPOINT

// --- Rutes d'Emails ---
app.post('/assignarEmail', assignarEmail); // <-- NOU ENDPOINT

// --- Rutes de Productes/Projectes ---
app.get('/productes', obtenirProductes);
app.get('/productes/:id_proj_nk/versions', obtenirVersionsPerProducte);
app.post('/registrarProducte', registrarNouProducte);
app.post('/assignarProducte', assignarProducteAUsuari);

// --- Rutes d'Auditoria ---
app.get('/audit-logs', obtenirRegistresAuditoria);

module.exports = app;