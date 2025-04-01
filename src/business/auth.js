import {
    API_AUTH_LOGIN
} from '../config/settings.js';

import {sendData} from '../data/apiMethods.js';
import {showError} from '../utils/sweetAlert.js';

// Función mejorada para sanitizar entradas
const sanitizeInput = (input) => {
    return input
        .trim()
        .replace(/[<>"'%;()&+\\]/g, '') // Bloquea caracteres peligrosos para XSS y SQL Injection
        .replace(/\s+/g, ' ') // Reduce espacios en blanco repetidos
        .replace(/\b(SELECT|INSERT|DELETE|DROP|UPDATE|CREATE|ALTER|WHERE|EXEC|CAST|CONVERT|UNION|XP_)\b/gi, ''); // Bloquea palabras clave SQL Injection
};

const login = async () => {
    let usuario = document.getElementById("email").value.trim();
    let clave = document.getElementById("password").value.trim();

    if (!usuario || !clave) {
        showError('Llena todos los campos para continuar.');
        return;
    }

    // Sanitizar entradas para evitar XSS
    usuario = sanitizeInput(usuario);
    clave = sanitizeInput(clave);

    try {
        const data = {usuario, clave};
        const response = await sendData(API_AUTH_LOGIN, "POST", data);

        if (response && response.token) {
            sessionStorage.setItem("token", response.token);
            window.location.href = "../../src/views/modules/home.html";
        } else {
            showError('Usuario y/o contraseña incorrecto.');
        }
    } catch (error) {
        showError(error.message || 'Ocurrió un error inesperado.');
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");

    if (loginButton) {
        loginButton.addEventListener("click", login);
    }
});