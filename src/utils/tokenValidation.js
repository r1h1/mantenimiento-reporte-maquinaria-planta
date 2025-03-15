import { API_AUTH_VALIDARTOKEN } from '../config/settings.js';
import { fetchDataToken } from '../data/apiMethods.js';

const verificarToken = async (token) => {
    if (!token) {
        console.warn("Token no encontrado.");
        return false;
    }

    try {
        const data = await fetchDataToken(API_AUTH_VALIDARTOKEN, "GET", {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json" // Asegurar que la API lo acepte
        });

        if (data.code === 200 && data.message === "Token válido.") {
            document.getElementById("loader").style.display = "none";
            document.getElementById("content").style.display = "block";
            return true;
        } else {
            document.getElementById("loader").style.display = "block";
            document.getElementById("content").style.display = "none";
            return false;
        }
    } catch (error) {
        console.error("Error en la validación del token:", error);
        return false;
    }
};

export { verificarToken };