// src/js/auth/adminAuth.js
import { auth } from '../../config/firebase-init.js';
import { 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'firebase/auth';

// Verificar si el usuario está autenticado
export function initAdminAuth() {
    // Redirigir a login si no está autenticado
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            if (!window.location.pathname.includes('/admin-login.html')) {
                window.location.href = '/admin-login.html';
            }
        } else {
            if (window.location.pathname.includes('/admin-login.html')) {
                window.location.href = '/admin.html';
            }
        }
    });
}

// Iniciar sesión
export async function adminLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        let message = 'Error en el inicio de sesión';
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            message = 'Credenciales incorrectas';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Email inválido';
        }
        return { success: false, message };
    }
}

// Cerrar sesión
export async function adminLogout() {
    try {
        await signOut(auth);
        window.location.href = '/admin-login.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        throw error;
    }
}