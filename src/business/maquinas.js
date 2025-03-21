import { verificarToken } from '../utils/tokenValidation.js';
import { API_AREAS, API_PLANTAS, API_TIPOMAQUINAS, API_MAQUINAS } from '../config/settings.js';
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

const obtenerPlantas = async () => {
    try {
        const selectPlanta = document.getElementById("planta");
        selectPlanta.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        const response = await fetchData(API_PLANTAS, "GET", obtenerHeaders);
        if (response) {
            response.forEach(planta => {
                const option = document.createElement("option");
                option.value = planta.idPlanta;
                option.textContent = planta.nombre + ' - ' + planta.descripcion;
                selectPlanta.appendChild(option);
            });
        }
        if (!response || response.length === 0) {
            const optionDefault = document.createElement("option");
            optionDefault.value = "0";
            optionDefault.textContent = "Selecciona...";
            selectPlanta.appendChild(optionDefault);
        }
    } catch (error) {
        showError(error);
    }
}

const obtenerTipoMaquinas = async () => {
    try {
        const selectTipoMaquina = document.getElementById("tipoMaquina");
        selectTipoMaquina.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        const response = await fetchData(API_TIPOMAQUINAS, "GET", obtenerHeaders());

        if (response) {
            response.forEach(area => {
                const option = document.createElement("option");
                option.value = area.idTipoMaquina;
                option.textContent = area.nombre + ' - ' + area.descripcion;
                selectTipoMaquina.appendChild(option);
            });
        }
    } catch (error) {
        showError(error);
    }
};

const obtenerMaquinas = async () => {
    try {
        const response = await fetchData(API_MAQUINAS, "GET", obtenerHeaders());

        if (response) {
            // Inicializar DataTable con los nombres correctos de las columnas
            $('#tabla-datos-dinamicos').DataTable({
                destroy: true, // Permite reinicializar la tabla sin errores
                data: response,   // Carga los datos dinámicos
                columns: [
                    { data: "idMaquina" },    
                    { data: "nombreCodigo" },
                    { data: "idTipoMaquina" },
                    { data: "idArea" },   
                    { data: "idPlanta" },     
                    {
                        data: "estado",
                        render: function(data, type, row) {
                            return data ? 'Activa' : 'Inactiva';
                        }
                    },
                    {
                        data: null,
                        render: function (data, type, row) {
                            return `
                        <button onclick="editarAreas(${JSON.stringify(row).replace(/'/g, "&#39;").replace(/"/g, "&quot;")})" class="btn btn-warning">Editar</button>
                        <button onclick="eliminarAreas(${row.idMaquina})" class="btn btn-danger">Eliminar</button>
                    `;
                        }
                    }
                ]
            });
        }
        else {
            return;
        }
    } catch (error) {
        showError(error || "Error al obtener las áreas.");
        return;
    }
}


const limpiar = function () {
}

const cargarTodasLasFuncionesGet = function () {
    obtenerAreas();
    obtenerPlantas();
    obtenerTipoMaquinas();
    obtenerMaquinas();
    //limpiar();
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
        else{
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
        //inicializarEventos();
    } catch (error) {
        console.error("Error en la inicialización:", error);
    }
});
