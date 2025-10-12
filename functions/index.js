
// Importa l'SDK d'Admin de Firebase per interactuar amb els serveis de Firebase
import admin from "firebase-admin";
import functions from "firebase-functions";
import cors from "cors";

// Inicialitza l'SDK d'Admin. Aquesta crida única configura l'entorn
// perquè les funcions puguin autenticar-se i realitzar accions amb privilegis.
admin.initializeApp();

const corsHandler = cors({origin: true});

// Aquí definirem les futures funcions del backend.
// Exemple:
// export const laMevaFuncio = functions.https.onRequest((req, res) => {
//   corsHandler(req, res, () => {
//     res.status(200).send("Hola des de NORKÄRŸM!");
//   });
// });
