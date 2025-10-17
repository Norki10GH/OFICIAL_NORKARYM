// functions/src/api.js
const express = require('express');
const cors = require('cors');
const { registrarNouAdmin, eliminarAdmin, editarAdmin } = require('./controllers/adminController.js');
const { assignarEmail } = require('./controllers/emailController.js');
const { obtenirRegistresAuditoria } = require('./controllers/auditController.js');
const { registrarNouProducte, obtenirProductes, obtenirVersionsPerProducte, assignarProducteAUsuari, obtenirProductesDetallats, editarProducte, eliminarProducte, crearNovaVersio, editarVersio, eliminarVersio } = require('./controllers/productController.js');
const { obtenirAdministradors, assignarRol, eliminarRol } = require('./controllers/rolController.js');
const { obtenirDefinicionsRols, crearDefinicioRol, editarDefinicioRol, eliminarDefinicioRol } = require('./controllers/rolDefinitionController.js');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// --- Rutes d'Administradors ---
app.post('/registrarAdmin', registrarNouAdmin);
app.delete('/administradors/:id', eliminarAdmin);
app.put('/administradors/:id', editarAdmin);

// --- Rutes de Rols ---
app.get('/administradors', obtenirAdministradors);
app.post('/assignarRol', assignarRol);
app.delete('/rols/:id', eliminarRol);

// --- Rutes de Definicions de Rols ---
app.get('/definicions-rols', obtenirDefinicionsRols);
app.post('/definicions-rols', crearDefinicioRol);
app.put('/definicions-rols/:id', editarDefinicioRol);
app.delete('/definicions-rols/:id', eliminarDefinicioRol);

// --- Rutes d'Emails ---
app.post('/assignarEmail', assignarEmail);

// --- Rutes de Productes/Projectes ---
app.get('/productes', obtenirProductes); // Per a selectors
app.get('/productes-detallats', obtenirProductesDetallats); // Per a la taula de gestió
app.post('/registrarProducte', registrarNouProducte);
app.post('/assignarProducte', assignarProducteAUsuari);
app.put('/productes/:id', editarProducte);
app.delete('/productes/:id', eliminarProducte);

// --- Rutes de Versions ---
app.get('/productes/:id_proj_nk/versions', obtenirVersionsPerProducte);
app.post('/productes/:id_proj_nk/versions', crearNovaVersio);
app.put('/versions/:id_versio', editarVersio);
app.delete('/versions/:id_versio', eliminarVersio);

// --- Rutes d'Auditoria ---
app.get('/audit-logs', obtenirRegistresAuditoria);

module.exports = app;