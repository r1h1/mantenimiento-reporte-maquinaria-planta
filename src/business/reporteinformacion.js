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

        // Limpiar ambos selects
        selectAsignacion.innerHTML = `<option value="0" selected>Selecciona...</option>`;

        const response = await fetchData(API_USUARIOS, "GET", obtenerHeaders());

        if (response) {
            response.forEach(usuario => {
                const option1 = document.createElement("option");
                option1.value = usuario.idUsuario;
                option1.textContent = usuario.nombreCompleto;
                selectAsignacion.appendChild(option1);
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

        // Limpiar ambos selects
        selectAsignacion.innerHTML = `<option value="0" selected>Selecciona...</option>`;

        const response = await fetchData(API_GRUPOS, "GET", obtenerHeaders());

        if (response) {
            response.forEach(grupo => {
                const option1 = document.createElement("option");
                option1.value = grupo.idGrupo;
                option1.textContent = grupo.nombre;
                selectAsignacion.appendChild(option1);
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

const postAsignacion = async () => {
    try {
        const idAsignacion = 0;
        const idReporte = document.getElementById("idReporteActual").innerHTML;
        const idGrupo = document.getElementById("grupoAsignacion").value;
        const idUsuario = document.getElementById("usuarioAsignacion").value;
        const estadoAsignado = document.getElementById("estadoAsignacion").value;
        const fechaInicioTrabajo = document.getElementById("fechaInicioAsignacion").value;
        const descripcionHallazgo = document.getElementById("descripcionHallazgoAsignacion").value;
        const materialesUtilizados = document.getElementById("descripcionMaterialesUtilizadosAsignacion").value;
        const estado = true;

        if (!idReporte || !idGrupo || !idUsuario || !estadoAsignado
            || !fechaInicioTrabajo || !descripcionHallazgo || !materialesUtilizados) {
            showError("Todos los campos son obligatorios.");
            return;
        }

        const data = {
            idAsignacion,
            idReporte,
            idGrupo,
            idUsuario,
            estadoAsignado,
            fechaInicioTrabajo,
            descripcionHallazgo,
            materialesUtilizados,
            estado
        };

        const response = await sendData(API_ASIGNACIONES, "POST", data, obtenerHeaders());

        if (response && response.code === 201) {
            showSuccess(response.message);
            cargarTodasLasFuncionesGet();
        }
    } catch (error) {
        showError(error);
    }
}

const postFinalizacion = async () => {
    try {
        const idFinalizacion = 0;
        const idAsignacion = document.getElementById("idAsignacionReporte").innerHTML;
        const fechaFinTrabajo = document.getElementById("fechaFinFinalizacion").value;
        const descripcionSolucion = document.getElementById("descripcionSolucionFinalizacion").value;
        const estadoFinalizado = document.getElementById("estadoFinalizacion").value;
        const estado = true;

        if (!idAsignacion || !fechaFinTrabajo
            || !descripcionSolucion || !estadoFinalizado) {
            showError("Todos los campos son obligatorios.");
            return;
        }

        const data = {
            idFinalizacion,
            idAsignacion,
            fechaFinTrabajo,
            descripcionSolucion,
            estadoFinalizado,
            estado
        };

        const response = await sendData(API_FINALIZACIONES, "POST", data, obtenerHeaders());

        if (response && response.code === 201) {
            showSuccess(response.message);
            cargarTodasLasFuncionesGet();
        }
    } catch (error) {
        showError(error);
    }
}


const obtenerAsignacion = async () => {
    try {
        const idReporte = document.getElementById("idReporteActual").innerHTML;
        const response = await fetchData(API_ASIGNACIONES, "GET", obtenerHeaders());

        if (response && Array.isArray(response)) {
            const asignacion = response.find(asig => asig.idReporte == idReporte);
            if (asignacion) {
                // Llenamos los campos
                document.getElementById("idAsignacionReporte").innerHTML = asignacion.idAsignacion;
                document.getElementById("grupoAsignacion").value = asignacion.idGrupo;
                document.getElementById("usuarioAsignacion").value = asignacion.idUsuario;
                document.getElementById("estadoAsignacion").value = asignacion.estadoAsignado;
                document.getElementById("estadoFinalizacion").value = asignacion.estadoAsignado;
                document.getElementById("fechaInicioAsignacion").value = asignacion.fechaInicioTrabajo?.split("T")[0];
                document.getElementById("descripcionHallazgoAsignacion").value = asignacion.descripcionHallazgo;
                document.getElementById("descripcionMaterialesUtilizadosAsignacion").value = asignacion.materialesUtilizados;

                // 🚫 Bloqueamos los campos
                document.getElementById("grupoAsignacion").disabled = true;
                document.getElementById("usuarioAsignacion").disabled = true;
                document.getElementById("estadoAsignacion").disabled = true;
                document.getElementById("fechaInicioAsignacion").disabled = true;
                document.getElementById("descripcionHallazgoAsignacion").disabled = true;
                document.getElementById("descripcionMaterialesUtilizadosAsignacion").disabled = true;
                document.getElementById("guardarAsignar").disabled = true;
            }
        }
    } catch (error) {
        showError("Error al obtener la asignación: " + error);
    }
};


const obtenerFinalizacion = async () => {
    try {
        const idAsignacion = document.getElementById("idAsignacionReporte").innerHTML;
        const response = await fetchData(API_FINALIZACIONES, "GET", obtenerHeaders());

        if (response && Array.isArray(response)) {
            const finalizacion = response.find(fin => fin.idAsignacion == idAsignacion);
            if (finalizacion) {
                // Llenamos los campos
                document.getElementById("estadoFinalizacion").value = finalizacion.estadoFinalizado;
                document.getElementById("fechaFinFinalizacion").value = finalizacion.fechaFinTrabajo?.split("T")[0];
                document.getElementById("descripcionSolucionFinalizacion").value = finalizacion.descripcionSolucion;

                // 🚫 Bloqueamos los campos
                document.getElementById("estadoFinalizacion").disabled = true;
                document.getElementById("fechaFinFinalizacion").disabled = true;
                document.getElementById("descripcionSolucionFinalizacion").disabled = true;
                document.getElementById("cerrarFinalizacion").disabled = true;
            }
        }
    } catch (error) {
        showError("Error al obtener la finalización: " + error);
    }
};



const cargarTodasLasFuncionesGet = async function () {
    obtenerInfoReporte(); // primero guardamos los parámetros

    await obtenerAreas();
    await obtenerMaquinas();
    await obtenerGrupo();
    await obtenerEmpleados();

    rellenarFormulario(); // ya con selects cargados

    const idReporte = reporteParams.id;
    if (idReporte) {
        await obtenerAsignacion(idReporte); // obtenemos la asignación
        await obtenerFinalizacion(); // obtenemos la finalización asociada
    }
};

const redirigirA401 = () => {
    window.location.href = "../../../src/views/pages/401.html";
};

const eventos = [
    {id: "closeSession", callback: closeSession},
    {id: "guardarAsignar", callback: postAsignacion},
    {id: "cerrarFinalizacion", callback: postFinalizacion}
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