// functions/src/api.js
const express = require('express');
const cors = require('cors');
const { registrarNouAdmin } = require('./controllers/adminController.js');

const app = express();

// Middlewares
app.use(cors({ origin: true }));
app.use(express.json());

// Rutes de l'API
app.post('/registrarAdmin', registrarNouAdmin);

// Exportem l'app d'Express
module.exports = app;