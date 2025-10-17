// CLIENT/src/config/apiConfig.js

function getApiBaseUrl() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Entorn de desenvolupament local (Firebase Emulator)
        return 'http://localhost:5001/tfg-norkaym/us-central1/api';
    } else {
        // Entorn de producció (Firebase Hosting & Functions)
        return 'https://us-central1-tfg-norkaym.cloudfunctions.net/api';
    }
}

export const API_BASE_URL = getApiBaseUrl();
