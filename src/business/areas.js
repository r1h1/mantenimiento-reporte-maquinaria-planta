import {verificarToken} from '../utils/tokenValidation.js';
import {API_AREAS, API_MENU, API_PLANTAS, API_ROL} from '../config/settings.js';
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
        const response = await fetchData(API_AREAS, "GET", obtenerHeaders());

        if (response) {
            // Inicializar DataTable con los nombres correctos de las columnas
            $('#tabla-datos-dinamicos').DataTable({
                destroy: true, // Permite reinicializar la tabla sin errores
                data: response,   // Carga los datos dinámicos
                columns: [
                    {data: "idArea"},       // Se cambia 'id' por 'idArea'
                    {data: "nombre"},
                    {data: "ubicacion"},
                    {data: "idPlanta"},     // Se cambia 'planta' por 'idPlanta'
                    {data: "descripcion"},
                    {
                        data: null,
                        render: function (data, type, row) {
                            return `
                        <button onclick="editarAreas(${JSON.stringify(row).replace(/'/g, "&#39;").replace(/"/g, "&quot;")})" class="btn btn-warning">Editar</button>
                        <button onclick="eliminarAreas(${row.idArea})" class="btn btn-danger">Eliminar</button>
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


const postAreas = async () => {
    try {
        const idArea = 0;
        const nombre = document.getElementById("nombre").value;
        const ubicacion = document.getElementById("ubicacion").value;
        const idPlanta = document.getElementById("planta").value;
        const descripcion = document.getElementById("descripcion").value;
        const estado = true;

        if (!nombre || !ubicacion || idPlanta == 0 || !descripcion) {
            showError("Todos los campos son obligatorios.");
            return;
        }

        const data = {
            idArea,
            nombre,
            ubicacion,
            idPlanta,
            descripcion,
            estado
        };

        const response = await sendData(API_AREAS, "POST", data, obtenerHeaders());

        if (response && response.code === 201) {
            showSuccess(response.message);
            cargarTodasLasFuncionesGet();
        }
    } catch (error) {
        showError(error);
    }
}

window.editarAreas = function (row) {
    document.getElementById("idArea").value = row.idArea;
    document.getElementById("nombre").value = row.nombre;
    document.getElementById("ubicacion").value = row.ubicacion;
    document.getElementById("planta").value = row.idPlanta;
    document.getElementById("descripcion").value = row.descripcion;
};

const putAreas = async () => {
    try {
        const idArea = document.getElementById("idArea").value;
        const nombre = document.getElementById("nombre").value;
        const ubicacion = document.getElementById("ubicacion").value;
        const idPlanta = document.getElementById("planta").value;
        const descripcion = document.getElementById("descripcion").value;
        const estado = true;

        if (!nombre || !ubicacion || idPlanta == 0 || !descripcion) {
            showError("Todos los campos son obligatorios.");
            return;
        }

        const data = {
            idArea,
            nombre,
            ubicacion,
            idPlanta,
            descripcion,
            estado
        };
        const response = await sendData(API_AREAS, "PUT", data, obtenerHeaders());

        if (response && response.code === 200) {
            showSuccess("Área actualizada correctamente.");
            cargarTodasLasFuncionesGet();
        }
    } catch (error) {
        showError("Error al actualizar el área: " + error);
    }
};

window.eliminarAreas = async (idArea) => {
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
            const response = await fetchData(`${API_AREAS}/${idArea}`, "DELETE", obtenerHeaders());

            if (response && response.code === 200) {
                showSuccess("Área eliminada correctamente.");
                cargarTodasLasFuncionesGet();
            } else {
                showError("No se pudo eliminar el área.");
            }
        } catch (error) {
            showError("Error al eliminar el área: " + error);
        }
    }
};


const limpiar = function () {
    document.getElementById("idArea").value = '';
    document.getElementById("nombre").value = '';
    document.getElementById("ubicacion").value = '';
    document.getElementById("planta").selectedIndex = 0;
    document.getElementById("descripcion").value = '';
}

const cargarTodasLasFuncionesGet = function () {
    obtenerAreas();
    obtenerPlantas();
    obtenerRolPorToken();
    limpiar();
}


const redirigirA401 = () => {
    window.location.href = "../../../src/views/pages/401.html";
};

const manejarGuardarArea = () => {
    const idArea = document.getElementById("idArea")?.value?.trim();
    if (!idArea || isNaN(idArea)) {
        postAreas();
    } else {
        putAreas();
    }
};

const eventos = [
    {id: "guardarArea", callback: manejarGuardarArea},
    {id: "limpiarArea", callback: limpiar},
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