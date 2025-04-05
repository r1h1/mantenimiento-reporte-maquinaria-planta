import {verificarToken} from '../utils/tokenValidation.js';
import {
    API_REPORTES,
    API_AREAS,
    API_MAQUINAS,
    API_FINALIZACIONES,
    API_ASIGNACIONES,
    API_ROL, API_MENU
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


const obtenerIncidenciasReportadas = async () => {
    try {
        const [reportes, asignaciones, finalizaciones] = await Promise.all([
            fetchData(API_REPORTES, "GET", obtenerHeaders()),
            fetchData(API_ASIGNACIONES, "GET", obtenerHeaders()),
            fetchData(API_FINALIZACIONES, "GET", obtenerHeaders())
        ]);

        if (reportes && Array.isArray(reportes)) {
            // Agregamos el estado general a cada reporte
            const reportesConEstado = reportes.map(reporte => {
                const asig = asignaciones.find(a => a.idReporte === reporte.idReporte);
                const fin = asig ? finalizaciones.find(f => f.idAsignacion === asig.idAsignacion) : null;

                let estadoGeneral = "Pendiente";
                if (fin) {
                    estadoGeneral = "Finalizado";
                } else if (asig) {
                    estadoGeneral = "Asignado";
                }

                return {
                    ...reporte,
                    estadoGeneral
                };
            });

            $('#tabla-datos-dinamicos').DataTable({
                destroy: true,
                data: reportesConEstado,
                columns: [
                    {
                        data: null,
                        render: function (row) {
                            return `
                                <button onclick="verReporte(${JSON.stringify(row).replace(/'/g, "&#39;").replace(/"/g, "&quot;")})" class="btn btn-primary">Ver</button>
                                <button onclick="eliminarReporte(${row.idReporte})" class="btn btn-danger">Eliminar</button>
                            `;
                        }
                    },
                    {
                        data: "estadoGeneral",
                        render: function (data) {
                            let badge = '';
                            switch (data) {
                                case "Pendiente":
                                    badge = '<span class="badge bg-warning text-dark">Pendiente</span>';
                                    break;
                                case "Asignado":
                                    badge = '<span class="badge bg-info text-dark">Asignado</span>';
                                    break;
                                case "Finalizado":
                                    badge = '<span class="badge bg-success text-white">Finalizado</span>';
                                    break;
                                default:
                                    badge = `<span class="badge bg-secondary">${data}</span>`;
                            }
                            return badge;
                        }
                    },
                    {data: "idReporte"},
                    {
                        data: "impacto",
                        render: function (data) {
                            switch (data) {
                                case "1":
                                case 1:
                                    return "Baja";
                                case "2":
                                case 2:
                                    return "Media";
                                case "3":
                                case 3:
                                    return "Alta";
                                case "4":
                                case 4:
                                    return "Crítica";
                                default:
                                    return data;
                            }
                        }
                    },
                    {
                        data: "estadoReporte",
                        render: function (data) {
                            switch (data) {
                                case "1":
                                case 1:
                                    return "Mantenimiento";
                                case "0":
                                case 0:
                                    return "Fallo";
                                default:
                                    return data;
                            }
                        }
                    },
                    {data: "idArea"},
                    {data: "idMaquina"},
                    {
                        data: "fechaReporte",
                        render: function (data) {
                            const fecha = new Date(data);
                            return fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString();
                        }
                    },
                    {data: "titulo"},
                    {
                        data: "personasLastimadas",
                        render: function (data) {
                            return data ? "Sí" : "No";
                        }
                    },
                    {
                        data: "danosMateriales",
                        render: function (data) {
                            return data ? "Sí" : "No";
                        }
                    }
                ],
                language: {
                    url: "//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json"
                }
            });
        } else {
            showError("No se encontraron reportes registrados.");
        }
    } catch (error) {
        showError("Ocurrió un error al obtener los reportes.");
        console.error(error);
    }
};


window.verReporte = function (row) {
    const params = new URLSearchParams({
        id: row.idReporte,
        area: row.area || row.idArea,
        maquina: row.maquina || row.idMaquina,
        impacto: row.impacto,
        personas: row.personasLastimadas,
        danos: row.danosMateriales,
        fecha: row.fechaReporte,
        titulo: row.titulo,
        medidas: row.medidasTomadas,
        descripcion: row.descripcion
    });

    location.href = "reporte_informacion.html?" + params.toString();
};


window.eliminarReporte = async (idReporte) => {
    const confirmDelete = await Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esta acción.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });

    if (confirmDelete.isConfirmed) {
        try {
            const response = await fetchData(`${API_REPORTES}/${idReporte}`, "DELETE", obtenerHeaders());

            if (response && response.code === 200) {
                showSuccess("Reporte eliminado correctamente.");
                cargarTodasLasFuncionesGet();
            } else {
                showError("No se pudo eliminar.");
            }
        } catch (error) {
            showError("Error al eliminar: " + error);
        }
    }
};


const postReporte = async () => {
    try {
        const campos = {
            tipoReporte: document.getElementById("tipoReporte"), // este sería "estadoReporte"
            impactoReporte: document.getElementById("impactoReporte"),
            areaReporte: document.getElementById("areaReporte"), // debe ser ID numérico
            maquinaReporte: document.getElementById("maquinaReporte"), // debe ser ID numérico
            tituloReporte: document.getElementById("tituloReporte"),
            descripcionReporte: document.getElementById("descripcionReporte"),
            medidasTomadasReporte: document.getElementById("medidasTomadasReporte"),
            personasLastimadasReporte: document.getElementById("personasLastimadasReporte"), // true/false
            danosMaterialesReporte: document.getElementById("danosMaterialesReporte"), // true/false
        };

        const hayCamposVacios = Object.values(campos).some(
            campo => !campo || campo.value.trim() === "" || campo.value === "Selecciona..."
        );

        if (hayCamposVacios) {
            showError("Por favor, complete todos los campos obligatorios antes de continuar.");
            return;
        }

        const data = {
            idReporte: 0, // se crea nuevo
            idArea: parseInt(campos.areaReporte.value),
            idMaquina: parseInt(campos.maquinaReporte.value),
            impacto: campos.impactoReporte.value.trim(),
            personasLastimadas: campos.personasLastimadasReporte.value === "true",
            danosMateriales: campos.danosMaterialesReporte.value === "true",
            fechaReporte: new Date().toISOString(),
            titulo: campos.tituloReporte.value.trim(),
            medidasTomadas: campos.medidasTomadasReporte.value.trim(),
            descripcion: campos.descripcionReporte.value.trim(),
            estadoReporte: campos.tipoReporte.value.trim(),
            estado: true
        };

        const response = await sendData(API_REPORTES, "POST", data, obtenerHeaders());

        if (response && response.code === 201) {
            showSuccess("El reporte ha sido registrado exitosamente.");
            cargarTodasLasFuncionesGet(); // recarga la información
            limpiar();
            const modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
            modal.hide();
        }

    } catch (error) {
        showError("Ocurrió un error al registrar el reporte. Por favor, inténtelo nuevamente. " + error);
        console.error(error);
    }
};


const limpiar = function () {
    const campos = {
        tipoReporte: document.getElementById("tipoReporte"),
        impactoReporte: document.getElementById("impactoReporte"),
        areaReporte: document.getElementById("areaReporte"),
        maquinaReporte: document.getElementById("maquinaReporte"),
        tituloReporte: document.getElementById("tituloReporte"),
        descripcionReporte: document.getElementById("descripcionReporte"),
        medidasTomadasReporte: document.getElementById("medidasTomadasReporte"),
        personasLastimadasReporte: document.getElementById("personasLastimadasReporte"),
        danosMaterialesReporte: document.getElementById("danosMaterialesReporte"),
    };

    for (const campo of Object.values(campos)) {
        if (campo) {
            if (campo.tagName === "SELECT") {
                campo.selectedIndex = 0; // volver al primer <option>
            } else {
                campo.value = ""; // limpiar texto
            }
        }
    }

    // Reiniciar select de máquinas
    const selectMaquinas = document.getElementById("maquinaReporte");
    if (selectMaquinas) {
        selectMaquinas.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        selectMaquinas.disabled = true;
    }
};

const cargarTodasLasFuncionesGet = function () {
    obtenerAreas();
    obtenerIncidenciasReportadas();
    obtenerRolPorToken();
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
    {id: "guardarReportar", callback: manejarGuardarReportar},
    {id: "limpiarReportar", callback: limpiar},
    {id: "closeSession", callback: closeSession}
];

const inicializarEventos = () => {
    eventos.forEach(({id, callback}) => asignarEvento(id, callback));

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