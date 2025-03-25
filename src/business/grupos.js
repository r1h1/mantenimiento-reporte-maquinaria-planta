import { verificarToken } from '../utils/tokenValidation.js';
import { API_AREAS, API_USUARIOS, API_GRUPOS, API_GRUPOUSUARIOS } from '../config/settings.js';
import { sendData, fetchData } from '../data/apiMethods.js';
import { showError, showSuccess } from '../utils/sweetAlert.js';

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
    return { "Authorization": `Bearer ${token}` };
};


const obtenerAreas = async () => {
    try {
        const selectArea = document.getElementById("area");
        selectArea.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        const response = await fetchData(API_AREAS, "GET", obtenerHeaders());

        if (response) {
            response.forEach(area => {
                const option = document.createElement("option");
                option.value = area.idArea;
                option.textContent = area.nombre;
                selectArea.appendChild(option);
            });
        }
    } catch (error) {
        showError(error);
    }
};


const obtenerEmpleados = async () => {
    try {
        const selectEmpleados = document.getElementById("empleado");
        selectEmpleados.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        const response = await fetchData(API_USUARIOS, "GET", obtenerHeaders());

        if (response) {
            response.forEach(area => {
                const option = document.createElement("option");
                option.value = area.idUsuario;
                option.textContent = area.nombreCompleto;
                selectEmpleados.appendChild(option);
            });
        }
    } catch (error) {
        showError(error);
    }
};



const limpiar = function () {

}

const cargarTodasLasFuncionesGet = function () {
    obtenerAreas();
    obtenerEmpleados();
}


const redirigirA401 = () => {
    window.location.href = "../../../src/views/pages/401.html";
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
        }
        else {
            cargarTodasLasFuncionesGet();
        }
    } catch (error) {
        console.error("Error inesperado en manejarValidacionToken:", error);
        sessionStorage.removeItem("token");
        redirigirA401();
    }
};

const manejarGuardar = () => {
    const idMaquina = document.getElementById("idMaquina")?.value?.trim();
    if (!idMaquina || isNaN(idMaquina)) {
        postMaquina();
    } else {
        putMaquina();
    }
};

const eventos = [
    { id: "guardarButton", callback: manejarGuardar },
    { id: "limpiarButton", callback: limpiar },
    { id: "closeSession", callback: closeSession }
];

const inicializarEventos = () => {
    eventos.forEach(({ id, callback }) => asignarEvento(id, callback));
};

const asignarEvento = (idElemento, callback) => {
    const elemento = document.getElementById(idElemento);
    if (elemento) {
        elemento.addEventListener("click", callback);
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