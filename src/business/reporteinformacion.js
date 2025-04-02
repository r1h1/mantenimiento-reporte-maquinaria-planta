import {verificarToken} from '../utils/tokenValidation.js';
import {API_REPORTES, API_FINALIZACIONES, API_ASIGNACIONES} from '../config/settings.js';
import {sendData, fetchData} from '../data/apiMethods.js';
import {showError, showSuccess} from '../utils/sweetAlert.js';

const closeSession = function () {
    try {
        sessionStorage.removeItem("token");
        window.location.href = "../../../index.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
};

const obtenerHeaders = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        closeSession();
        return null;
    }
    //retorna el token
    return {"Authorization": `Bearer ${token}`};
};

const limpiar = function () {
    //
}

const cargarTodasLasFuncionesGet = function () {
    //
    limpiar();
}


const redirigirA401 = () => {
    window.location.href = "../../../src/views/pages/401.html";
};

const manejarGuardarReportarInformacion = () => {
    const idReporteInformacion = document.getElementById("idReporteInformacion")?.value?.trim();
    if (!idReporteInformacion || isNaN(idReporteInformacion)) {
        postReporteInformacion();
    } else {
        putReporteInformacion();
    }
};

const eventos = [
    {id: "guardarReportarInformacion", callback: manejarGuardarReportarInformacion},
    {id: "limpiarReportarInformacion", callback: limpiar},
    {id: "closeSession", callback: closeSession}
];

const inicializarEventos = () => {
    eventos.forEach(({id, callback}) => asignarEvento(id, callback));
};

const asignarEvento = (idElemento, callback) => {
    const elemento = document.getElementById(idElemento);
    if (elemento) {
        elemento.addEventListener("click", callback);
    }
};

const manejarValidacionToken = async () => {
    try {
        const token = sessionStorage.getItem("token");

        if (!token || token === "null" || token === "undefined") {
            return redirigirA401();
        }

        const esValido = await verificarToken(token);

        if (!esValido) {
            sessionStorage.removeItem("token");
            return redirigirA401();
        } else {
            cargarTodasLasFuncionesGet();
        }
    } catch (error) {
        console.error("Error inesperado en manejarValidacionToken:", error);
        sessionStorage.removeItem("token");
        redirigirA401();
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await manejarValidacionToken();
        inicializarEventos();
    } catch (error) {
        console.error("Error en la inicialización:", error);
    }
});