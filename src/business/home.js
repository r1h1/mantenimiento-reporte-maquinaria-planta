import {verificarToken} from '../utils/tokenValidation.js';

const closeSession = function () {
    try {
        sessionStorage.removeItem("token");
        window.location.href = "../../../index.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = sessionStorage.getItem("token"); // Obtener token del almacenamiento
        const closeSessionButton = document.getElementById("closeSession");

        if (!token) {
            window.location.href = "../../../src/views/pages/401.html";
            return;
        }

        const esValido = await verificarToken(token); // Validar token

        if (!esValido) {
            sessionStorage.removeItem("token");
            window.location.href = "../../../src/views/pages/401.html";
            return;
        }

        if (closeSessionButton) {
            closeSessionButton.addEventListener("click", closeSession);
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
});