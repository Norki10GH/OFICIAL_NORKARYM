// CLIENT/COM_HTML/firebase-init.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyADSzKjUNDow4RqhZ6bA14jwVB_FfsEo0Y",
    authDomain: "norkarym.firebaseapp.com",
    projectId: "norkarym",
    storageBucket: "norkarym.appspot.com",
    messagingSenderId: "389577112007",
    appId: "1:389577112007:web:3318d353b260bb1ff081e2",
    measurementId: "G-JWTZP12DK3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);