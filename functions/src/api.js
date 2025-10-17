// functions/src/api.js
import express from 'express';
import cors from 'cors';
import { registrarNouAdmin } from './controllers/adminController.js';
import { obtenirRegistresAuditoria } from './controllers/auditController.js'; // <-- IMPORTA LA NOVA FUNCIÓ

const app = express();

// Middlewares
app.use(cors({ origin: true }));
app.use(express.json());

// Rutes de l'API
app.post('/registrarAdmin', registrarNouAdmin);
app.get('/audit-logs', obtenirRegistresAuditoria); // <-- AFEGEIX LA NOVA RUTA

// Exportem l'app d'Express
export default app;