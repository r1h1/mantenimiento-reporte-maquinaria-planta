import {verificarToken} from '../utils/tokenValidation.js';
import {API_AREAS, API_USUARIOS, API_GRUPOS, API_GRUPOUSUARIOS, API_ROL, API_MENU} from '../config/settings.js';
import {sendData, fetchData} from '../data/apiMethods.js';
import {showError, showSuccess} from '../utils/sweetAlert.js';

let empleadosTemporales = []; // Almacena temporalmente los empleados seleccionados

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

// Obtener Empleados
const obtenerEmpleados = async () => {
    try {
        const selectEmpleados = document.getElementById("empleado");
        selectEmpleados.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        const response = await fetchData(API_USUARIOS, "GET", obtenerHeaders());

        if (response) {
            response.forEach(usuario => {
                const option = document.createElement("option");
                option.value = usuario.idUsuario;
                option.textContent = usuario.nombreCompleto;
                selectEmpleados.appendChild(option);
            });
        }
    } catch (error) {
        showError(error);
    }
};

// Agregar datos temporales a la tabla
const guardarDatosTemporales = () => {
    const selectEmpleado = document.getElementById("empleado");
    const idUsuario = selectEmpleado.value;
    const nombreEmpleado = selectEmpleado.options[selectEmpleado.selectedIndex].text;
    const area = document.getElementById("area");
    const idArea = area.value;
    const nombreArea = area.options[area.selectedIndex].text;

    if (idUsuario === "0" || idArea === "0") {
        showError("Seleccioná un empleado y un área.");
        return;
    }

    // Verificar si el empleado ya fue agregado
    if (empleadosTemporales.some(emp => emp.idUsuario === parseInt(idUsuario))) {
        showError("El empleado ya está asignado al grupo.");
        return;
    }

    const nuevoEmpleado = {
        idUsuario: parseInt(idUsuario),
        nombre: nombreEmpleado, // Solo para visualización
        idArea: parseInt(idArea),
        nombreArea: nombreArea // Solo para visualización
    };

    empleadosTemporales.push(nuevoEmpleado);
    actualizarTablaEmpleados();
};

// Actualizar tabla de empleados temporales
const actualizarTablaEmpleados = () => {
    const tablaBody = document.querySelector("#tabla-datos-temporales");
    tablaBody.innerHTML = "";

    empleadosTemporales.forEach((emp, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${emp.nombre}</td>
            <td>${emp.nombreArea}</td>
            <td>
                <button class="btn btn-danger btn-sm eliminar-btn" data-index="${index}">
                    Eliminar
                </button>
            </td>
        `;
        tablaBody.appendChild(fila);
    });

    // Asignar evento a los botones "Eliminar"
    document.querySelectorAll(".eliminar-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.dataset.index);
            eliminarEmpleadoTemporal(index);
        });
    });
};

// Eliminar empleado de la tabla temporal
const eliminarEmpleadoTemporal = (index) => {
    empleadosTemporales.splice(index, 1);
    actualizarTablaEmpleados();
};

// Crear Grupo
const postGrupo = async () => {
    const nombreGrupo = document.getElementById("nombreGrupo").value.trim();
    const idArea = document.getElementById("area").value;
    const descripcion = document.getElementById("descripcion").value.trim();

    if (!nombreGrupo || idArea === "0" || empleadosTemporales.length === 0) {
        showError("Todos los campos son obligatorios.");
        return;
    }

    const nuevoGrupo = {
        nombre: nombreGrupo,
        idArea: parseInt(idArea),
        descripcion: descripcion
    };

    try {
        const response = await sendData(API_GRUPOS, "POST", nuevoGrupo, obtenerHeaders());

        if (response?.isSuccess) {
            showSuccess("Grupo creado exitosamente");
            const idGrupo = response.id;
            await postGrupoUsuarios(idGrupo);
            obtenerGrupos(); // Recargar tabla principal de grupos
            limpiarFormulario();
        } else {
            showError(response.message || "Error al crear el grupo");
        }
    } catch (error) {
        showError("Error al crear el grupo.");
    }
};

// Insertar Usuarios en GrupoUsuarios evitando duplicados
const postGrupoUsuarios = async (idGrupo) => {
    // Eliminar duplicados de empleados temporales
    const empleadosUnicos = Array.from(
        new Map(empleadosTemporales.map(emp => [emp.idUsuario, emp])).values()
    );

    for (const emp of empleadosUnicos) {
        const nuevoGrupoUsuario = {
            idGrupo: parseInt(idGrupo),
            idUsuario: parseInt(emp.idUsuario),
            estado: true
        };

        try {
            await sendData(API_GRUPOUSUARIOS, "POST", nuevoGrupoUsuario, obtenerHeaders());
        } catch (error) {
            showError(`Error al asignar usuario ID: ${emp.idUsuario}`);
        }
    }
};

// Limpiar Formulario y Tabla Temporal
const limpiarFormulario = () => {
    document.getElementById("nombreGrupo").value = "";
    document.getElementById("area").value = "0";
    document.getElementById("descripcion").value = "";
    document.getElementById("empleado").value = "0";
    empleadosTemporales = [];
    actualizarTablaEmpleados();
};

// Obtener Grupos
const obtenerGrupos = async () => {
    try {
        const response = await fetchData(API_GRUPOS, "GET", obtenerHeaders());

        if (response) {
            $('#tabla-datos-dinamicos').DataTable({
                destroy: true,
                data: response,
                columns: [
                    {data: "idGrupo"},
                    {data: "nombre"},
                    {data: "descripcion"},
                    {data: "idArea"},
                    {
                        data: null,
                        render: function (data, type, row) {
                            return `
                            <button onclick="eliminarGrupo(${row.idGrupo})" class="btn btn-danger">Eliminar</button>
                            <button onclick="verEmpleadosGrupo(${row.idGrupo})" class="btn btn-primary">Empleados</button>
                            `;
                        }
                    }
                ]
            });
        }
    } catch (error) {
        showError(error || "Error al obtener los grupos.");
    }
};


// Obtener empleados del grupo y mostrarlos en el modal
window.verEmpleadosGrupo = async function (idGrupo) {
    document.getElementById("idGrupoModal").textContent = idGrupo;

    try {
        const response = await fetchData(`${API_GRUPOUSUARIOS}/Grupo/${idGrupo}`, "GET", obtenerHeaders());

        if (response?.length > 0) {
            const tablaBody = document.querySelector("#tabla-empleados-modal tbody");
            tablaBody.innerHTML = "";

            response.forEach(emp => {
                const fila = `
                    <tr>
                        <td>${emp.idGrupo}</td>
                        <td>${emp.idUsuario}</td>
                    </tr>
                `;
                tablaBody.innerHTML += fila;
            });
        } else {
            document.querySelector("#tabla-empleados-modal tbody").innerHTML = `
                <tr>
                    <td colspan="2" class="text-center">No hay empleados asignados a este grupo.</td>
                </tr>
            `;
        }

        let modal = new bootstrap.Modal(document.getElementById("exampleModal"));
        modal.show();

    } catch (error) {
        showError("Error al obtener los empleados del grupo.");
    }
};


window.eliminarGrupo = async (idGrupo) => {
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
            const response = await fetchData(`${API_GRUPOS}/${idGrupo}`, "DELETE", obtenerHeaders());

            if (response && response.code === 200) {
                showSuccess("Grupo eliminado correctamente.");
                cargarTodasLasFuncionesGet();
            } else {
                showError("No se pudo eliminar.");
            }
        } catch (error) {
            showError("Error al eliminar: " + error);
        }
    }
};


// Redirigir al usuario a la página de error 401 si el token no es válido
const redirigirA401 = () => {
    window.location.href = "../../../src/views/pages/401.html";
};

// Validación del token
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
        sessionStorage.removeItem("token");
        redirigirA401();
    }
};

// Cargar Funciones Iniciales
const cargarTodasLasFuncionesGet = function () {
    obtenerAreas();
    obtenerEmpleados();
    obtenerRolPorToken();
    obtenerGrupos();
};

// Guardar datos temporales
const manejarGuardarTemporal = () => {
    guardarDatosTemporales();
};

// Guardar Grupo y Empleados
const manejarGuardar = () => {
    postGrupo();
};

const eventos = [
    {id: "guardarTemporalButton", callback: manejarGuardarTemporal},
    {id: "guardarButton", callback: manejarGuardar},
    {id: "limpiarButton", callback: limpiarFormulario},
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