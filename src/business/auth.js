import {
    API_AUTH_LOGIN
} from '../config/settings.js';

import { sendData } from '../data/apiMethods.js';
import { showError } from '../utils/sweetAlert.js';

const login = async () => {
    const usuario = document.getElementById("email").value;
    const clave = document.getElementById("password").value;

    if (!usuario || !clave) {
        showError('Llena todos los campos para continuar.');
        return;
    }

    try {
        const data = { usuario, clave };
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