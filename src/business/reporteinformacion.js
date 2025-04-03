import {verificarToken} from '../utils/tokenValidation.js';
import {
    API_REPORTES,
    API_FINALIZACIONES,
    API_ASIGNACIONES,
    API_GRUPOS,
    API_AREAS,
    API_MAQUINAS,
    API_USUARIOS
} from '../config/settings.js';
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
    return {"Authorization": `Bearer ${token}`};
};

// Obtener Áreas
const obtenerAreas = async () => {
    try {
        const selectArea = document.getElementById("areaInformacion");
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

// Obtener empleados
const obtenerEmpleados = async () => {
    try {
        const selectAsignacion = document.getElementById("usuarioAsignacion");
        const selectFinalizacion = document.getElementById("usuarioFinalizacion");

        // Limpiar ambos selects
        selectAsignacion.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        selectFinalizacion.innerHTML = `<option value="0" selected>Selecciona...</option>`;

        const response = await fetchData(API_USUARIOS, "GET", obtenerHeaders());

        if (response) {
            response.forEach(usuario => {
                const option1 = document.createElement("option");
                option1.value = usuario.idUsuario;
                option1.textContent = usuario.nombreCompleto;
                selectAsignacion.appendChild(option1);

                const option2 = document.createElement("option");
                option2.value = usuario.idUsuario;
                option2.textContent = usuario.nombreCompleto;
                selectFinalizacion.appendChild(option2);
            });
        }
    } catch (error) {
        showError(error);
    }
};


// Obtener Grupos
const obtenerGrupo = async () => {
    try {
        const selectAsignacion = document.getElementById("grupoAsignacion");
        const selectFinalizacion = document.getElementById("grupoFinalizacion");

        // Limpiar ambos selects
        selectAsignacion.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        selectFinalizacion.innerHTML = `<option value="0" selected>Selecciona...</option>`;

        const response = await fetchData(API_GRUPOS, "GET", obtenerHeaders());

        if (response) {
            response.forEach(grupo => {
                const option1 = document.createElement("option");
                option1.value = grupo.idGrupo;
                option1.textContent = grupo.nombre;
                selectAsignacion.appendChild(option1);

                const option2 = document.createElement("option");
                option2.value = grupo.idGrupo;
                option2.textContent = grupo.nombre;
                selectFinalizacion.appendChild(option2);
            });
        }
    } catch (error) {
        showError(error);
    }
};


const obtenerMaquinas = async () => {
    try {
        const selectMaquinas = document.getElementById("maquinaInformacion");
        selectMaquinas.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        const response = await fetchData(API_MAQUINAS, "GET", obtenerHeaders());

        if (response) {
            response.forEach(usuario => {
                const option = document.createElement("option");
                option.value = usuario.idMaquina;
                option.textContent = usuario.nombreCodigo;
                selectMaquinas.appendChild(option);
            });
        }
    } catch (error) {
        showError(error);
    }
};


let reporteParams = {};

const obtenerInfoReporte = () => {
    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");
    const area = params.get("area");
    const maquina = params.get("maquina");
    const impacto = params.get("impacto");
    const personas = params.get("personas");
    const danos = params.get("danos");
    const fecha = params.get("fecha");
    const titulo = params.get("titulo");
    const medidas = params.get("medidas");
    const descripcion = params.get("descripcion");

    if (
        !id || !area || !maquina || !impacto || personas === null || danos === null ||
        !fecha || !titulo || !medidas || !descripcion
    ) {
        showError("Faltan parámetros en la URL");
        return;
    }

    // Guardamos los valores para luego asignarlos cuando los selects ya estén listos
    reporteParams = {
        id,
        area,
        maquina,
        impacto,
        personas,
        danos,
        fecha,
        titulo,
        medidas,
        descripcion
    };
};

const rellenarFormulario = () => {
    const {
        id, area, maquina, impacto, personas,
        danos, fecha, titulo, medidas, descripcion
    } = reporteParams;

    document.getElementById("idReporteActual").innerHTML = id || "N/A";
    document.getElementById("areaInformacion").value = area;
    document.getElementById("maquinaInformacion").value = maquina;
    document.getElementById("impactoInformacion").value = impacto;
    document.getElementById("personasLastimadasInformacion").value = personas;
    document.getElementById("danosMaterialesInformacion").value = danos;
    document.getElementById("fechaReporteInformacion").value = fecha.split("T")[0];
    document.getElementById("tituloReporteInformacion").value = titulo;
    document.getElementById("medidasTomadasInformacion").value = medidas;
    document.getElementById("descripcionInformacion").value = descripcion;
};


const limpiar = function () {
    //
};

const cargarTodasLasFuncionesGet = async function () {
    obtenerInfoReporte(); // primero guardamos los parámetros
    await obtenerAreas();     // esperamos a que termine
    await obtenerMaquinas();  // igual aquí
    await obtenerGrupo();
    obtenerEmpleados(); // este no es obligatorio para el form actual
    rellenarFormulario(); // ya con los selects cargados, llenamos los campos
};

const redirigirA401 = () => {
    window.location.href = "../../../src/views/pages/401.html";
};

const manejarGuardarReportar = () => {
    const idReporteInformacion = document.getElementById("idReporteInformacion")?.value?.trim();
    if (!idReporteInformacion || isNaN(idReporteInformacion)) {
        postReporteInformacion();
    } else {
        putReporteInformacion();
    }
};

const eventos = [
    {id: "guardarAsignar", callback: manejarGuardarReportar},
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