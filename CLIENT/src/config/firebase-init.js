// CLIENT/src/config/firebase-init.js// oficial 1.0
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Les claus ara es llegeixen de forma segura des de les variables d'entorn de Vite.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Funció per obtenir la URL base de les Cloud Functions
export function getFunctionUrl(functionName) {
  const projectId = firebaseConfig.projectId;
  // Canvia "europe-west1" si les teves funcions estan en una altra regió
  return `https://europe-west1-${projectId}.cloudfunctions.net/${functionName}`;
}