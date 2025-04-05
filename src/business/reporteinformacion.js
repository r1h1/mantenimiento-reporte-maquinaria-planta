import {verificarToken} from '../utils/tokenValidation.js';
import {
    API_REPORTES,
    API_FINALIZACIONES,
    API_ASIGNACIONES,
    API_GRUPOS,
    API_AREAS,
    API_MAQUINAS,
    API_USUARIOS, API_ROL, API_MENU
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


const obtenerRolPorToken = async () => {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) return showError("Token no encontrado en sessionStorage");

        const payloadBase64 = token.split('.')[1];
        const payloadJson = JSON.parse(atob(payloadBase64));
        const rol = payloadJson.role;

        if (!rol) return;

        await cargarMenuSegunRol(rol);
    } catch (error) {
        showError("Error al obtener rol del token:", error);
    }
};



const cargarMenuSegunRol = async (rol) => {
    try {
        // Claves para guardar en localStorage el menú y la fecha en que se guardó
        const menuKey = `menu_rol_${rol}`;
        const fechaKey = `menu_fecha_rol_${rol}`;

        // Intentamos obtener del almacenamiento local
        const menuGuardado = localStorage.getItem(menuKey);
        const fechaGuardada = localStorage.getItem(fechaKey);

        // Obtenemos la fecha actual (solo yyyy-mm-dd)
        const fechaHoy = new Date().toISOString().split("T")[0];

        let menuItems = [];

        // Verificamos si ya hay un menú guardado y si es del día de hoy
        const hayMenuVigente = menuGuardado && fechaGuardada === fechaHoy;

        if (hayMenuVigente) {
            // Si el menú está guardado y es reciente, lo usamos
            menuItems = JSON.parse(menuGuardado);
        } else {
            // Si no hay menú guardado o está desactualizado, pedimos info al backend

            // 1. Obtener lista de roles
            const roles = await fetchData(API_ROL, "GET", obtenerHeaders);
            if (!roles || roles.length === 0) {
                return showError("No se encontraron roles");
            }

            // 2. Buscar el rol actual del usuario
            const rolEncontrado = roles.find(r => r.idRol == rol);
            if (!rolEncontrado) {
                return showError("Rol no encontrado");
            }

            const idMenu = rolEncontrado.idMenu;

            // 3. Obtener todos los menús disponibles
            const menus = await fetchData(API_MENU, "GET", obtenerHeaders);
            if (!menus || menus.length === 0) {
                return showError("No se encontraron menús");
            }

            // 4. Buscar el menú correspondiente al rol
            const menuRol = menus.find(m => m.idMenu == idMenu);
            if (!menuRol) {
                return showError("Menú no encontrado");
            }

            // 5. Convertir el menú en string JSON a objeto JS
            menuItems = JSON.parse(menuRol.rutaHTML);

            // 6. Guardar el menú en localStorage con la fecha de hoy
            localStorage.setItem(menuKey, JSON.stringify(menuItems));
            localStorage.setItem(fechaKey, fechaHoy);
        }

        // 7. Pintar el menú en la interfaz (DOM)
        const menuContainer = document.getElementById("menu-dinamico");
        menuContainer.innerHTML = ""; // Limpiar lo anterior

        // Recorremos cada ítem del menú y lo insertamos en el HTML
        menuItems.forEach(item => {
            const li = document.createElement("li");
            const a = document.createElement("a");

            a.href = item.ruta;
            a.textContent = item.nombre;

            // Si la página actual coincide con la ruta del ítem, lo marcamos como activo
            if (window.location.pathname.includes(item.ruta)) {
                a.classList.add("active");
            }

            li.appendChild(a);
            menuContainer.appendChild(li);
        });

    } catch (error) {
        // Si algo sale mal, mostramos un error personalizado
        showError("Error al cargar menú por rol:", error);
    }
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
    await obtenerRolPorToken();

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