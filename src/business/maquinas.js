import {verificarToken} from '../utils/tokenValidation.js';
import {API_AREAS, API_PLANTAS, API_TIPOMAQUINAS, API_MAQUINAS, API_ROL, API_MENU} from '../config/settings.js';
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
                    {data: "idMaquina"},
                    {data: "nombreCodigo"},
                    {data: "idTipoMaquina"},
                    {data: "idArea"},
                    {data: "idPlanta"},
                    {
                        data: "estado",
                        render: function (data, type, row) {
                            return data ? 'Activa' : 'Inactiva';
                        }
                    },
                    {
                        data: null,
                        render: function (data, type, row) {
                            return `
                        <button onclick="editarMaquina(${JSON.stringify(row).replace(/'/g, "&#39;").replace(/"/g, "&quot;")})" class="btn btn-warning">Editar</button>
                        <button onclick="eliminarMaquina(${row.idMaquina})" class="btn btn-danger">Eliminar</button>
                    `;
                        }
                    }
                ]
            });
        } else {
            return;
        }
    } catch (error) {
        showError(error || "Error al obtener las áreas.");
        return;
    }
}


const postMaquina = async () => {
    try {
        const idMaquina = 0;
        const nombreCodigo = document.getElementById("nombreCodigo").value;
        const idTipoMaquina = document.getElementById("tipoMaquina").value;
        const idArea = document.getElementById("area").value;
        const idPlanta = document.getElementById("planta").value;
        const estado = document.getElementById("estado").value === "true";

        if (!nombreCodigo || !idTipoMaquina || !idArea || !idPlanta || !estado) {
            showError("Todos los campos son obligatorios.");
            return;
        }

        const data = {
            idMaquina,
            nombreCodigo,
            idTipoMaquina,
            idArea,
            idPlanta,
            estado
        };

        const response = await sendData(API_MAQUINAS, "POST", data, obtenerHeaders());

        if (response && response.code === 201) {
            showSuccess(response.message);
            cargarTodasLasFuncionesGet();
        }
    } catch (error) {
        showError(error);
    }
}

window.editarMaquina = function (row) {
    document.getElementById("idMaquina").value = row.idMaquina;
    document.getElementById("nombreCodigo").value = row.nombreCodigo;
    document.getElementById("tipoMaquina").value = row.idTipoMaquina;
    document.getElementById("area").value = row.idArea;
    document.getElementById("planta").value = row.idPlanta;
    document.getElementById("estado").value = row.estado;
};

const putMaquina = async () => {
    try {
        const idMaquina = document.getElementById("idMaquina").value;
        const nombreCodigo = document.getElementById("nombreCodigo").value;
        const idTipoMaquina = document.getElementById("tipoMaquina").value;
        const idArea = document.getElementById("area").value;
        const idPlanta = document.getElementById("planta").value;
        const estado = document.getElementById("estado").value === "true";

        if (!nombreCodigo || !idTipoMaquina || !idArea || !idPlanta || !estado) {
            showError("Todos los campos son obligatorios.");
            return;
        }

        const data = {
            idMaquina,
            nombreCodigo,
            idTipoMaquina,
            idArea,
            idPlanta,
            estado
        };

        const response = await sendData(API_MAQUINAS, "PUT", data, obtenerHeaders());

        if (response && response.code === 200) {
            showSuccess('Actualización correcta.');
            cargarTodasLasFuncionesGet();
        }
    } catch (error) {
        showError(error);
    }
};


window.eliminarMaquina = async (idMaquina) => {
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
            const response = await fetchData(`${API_MAQUINAS}/${idMaquina}`, "DELETE", obtenerHeaders());

            if (response && response.code === 200) {
                showSuccess('Eliminado correcto.');
                cargarTodasLasFuncionesGet();
            } else {
                showError(response.message);
            }
        } catch (error) {
            showError(error);
        }
    }
};


const limpiar = function () {
    document.getElementById("idMaquina").value = '';
    document.getElementById("nombreCodigo").value = '';
    document.getElementById("tipoMaquina").selectedIndex = 0;
    document.getElementById("area").selectedIndex = 0;
    document.getElementById("planta").selectedIndex = 0;
    document.getElementById("estado").selectedIndex = 0;
}

const cargarTodasLasFuncionesGet = function () {
    obtenerAreas();
    obtenerPlantas();
    obtenerTipoMaquinas();
    obtenerMaquinas();
    obtenerRolPorToken();
    limpiar();
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
        } else {
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
    {id: "guardarButton", callback: manejarGuardar},
    {id: "limpiarButton", callback: limpiar},
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

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await manejarValidacionToken();
        inicializarEventos();
    } catch (error) {
        console.error("Error en la inicialización:", error);
    }
});
