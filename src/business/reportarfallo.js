import {verificarToken} from '../utils/tokenValidation.js';
import {API_REPORTES, API_AREAS, API_MAQUINAS, API_PLANTAS} from '../config/settings.js';
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
    return { "Authorization": `Bearer ${token}` };
};

const obtenerAreas = async () => {
    try {
        const selectArea = document.getElementById("areaReporte");
        const selectMaquinas = document.getElementById("maquinaReporte");

        // Resetear ambos selects
        selectArea.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        selectMaquinas.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        selectMaquinas.disabled = true;

        const response = await fetchData(API_AREAS, "GET", obtenerHeaders);
        if (response && response.length > 0) {
            response.forEach(area => {
                const option = document.createElement("option");
                option.value = area.idArea;
                option.textContent = area.nombre;
                selectArea.appendChild(option);
            });
            selectArea.disabled = false;
        } else {
            const optionDefault = document.createElement("option");
            optionDefault.value = "0";
            optionDefault.textContent = "No hay áreas disponibles";
            selectArea.appendChild(optionDefault);
            selectArea.disabled = true;
        }
    } catch (error) {
        showError(error);
    }
};

const cargarMaquinasPorArea = async () => {
    try {
        const selectArea = document.getElementById("areaReporte");
        const idArea = selectArea.value;

        const selectMaquinas = document.getElementById("maquinaReporte");
        selectMaquinas.innerHTML = `<option value="0" selected>Selecciona...</option>`;

        if (!idArea || idArea === "0") {
            selectMaquinas.disabled = true;
            return;
        }

        const response = await fetchData(`${API_MAQUINAS}/area/${idArea}`, "GET", obtenerHeaders);
        if (response && response.data && response.data.length > 0) {
            response.data.forEach(maquina => {
                const option = document.createElement("option");
                option.value = maquina.idMaquina;
                option.textContent = maquina.nombreCodigo;
                selectMaquinas.appendChild(option);
            });
            selectMaquinas.disabled = false;
        } else {
            const option = document.createElement("option");
            option.value = "0";
            option.textContent = "No hay máquinas en esta área";
            selectMaquinas.appendChild(option);
            selectMaquinas.disabled = true;
        }
    } catch (error) {
        showError(error);
    }
};

const limpiar = function () {
    const selectMaquinas = document.getElementById("maquinaReporte");
    if (selectMaquinas) {
        selectMaquinas.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        selectMaquinas.disabled = true;
    }
};

const cargarTodasLasFuncionesGet = function () {
    obtenerAreas();
    limpiar();
};

const redirigirA401 = () => {
    window.location.href = "../../../src/views/pages/401.html";
};

const manejarGuardarReportar = () => {
    const idReporte = document.getElementById("idReporte")?.value?.trim();
    if (!idReporte || isNaN(idReporte)) {
        postReporte();
    } else {
        putReporte();
    }
};

const eventos = [
    { id: "guardarReportar", callback: manejarGuardarReportar },
    { id: "limpiarReportar", callback: limpiar },
    { id: "closeSession", callback: closeSession }
];

const inicializarEventos = () => {
    eventos.forEach(({ id, callback }) => asignarEvento(id, callback));

    const selectArea = document.getElementById("areaReporte");
    if (selectArea) {
        selectArea.addEventListener("change", cargarMaquinasPorArea);
    }
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