// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADSzKjUNDow4RqhZ6bA14jwVB_FfsEo0Y",
  authDomain: "norkarym.firebaseapp.com",
  projectId: "norkarym",
  storageBucket: "norkarym.firebasestorage.app",
  messagingSenderId: "389577112007",
  appId: "1:389577112007:web:8b5a21a2082da4eaf081e2",
  measurementId: "G-Q6K9R3KRQ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);