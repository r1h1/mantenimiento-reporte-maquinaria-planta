import {verificarToken} from '../utils/tokenValidation.js';
import {API_USUARIOS, API_AREAS, API_ROL, API_AUTH_CAMBIARCLAVE} from '../config/settings.js';
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

const obtenerUsuarios = async () => {
    try {
        const response = await fetchData(API_USUARIOS, "GET", obtenerHeaders());

        if (response) {
            // Inicializar DataTable con los nombres correctos de las columnas
            $('#tabla-datos-dinamicos').DataTable({
                destroy: true, // Permite reinicializar la tabla sin errores
                data: response,   // Carga los datos dinámicos
                columns: [
                    {data: "idUsuario"},
                    {data: "nombreCompleto"},
                    {data: "telefonoPersonal"},
                    {data: "telefonoCorporativo"},
                    {data: "direccion"},
                    {data: "correoElectronico"},
                    {data: "idArea"},
                    {data: "usuario"},
                    {data: "idRol"},
                    {
                        data: null,
                        render: function (data, type, row) {
                            return `
                        <button onclick="editarUsuario(${JSON.stringify(row).replace(/'/g, "&#39;").replace(/"/g, "&quot;")})" class="btn btn-warning">Editar</button>
                        <button onclick="cambiarClave(${row.idUsuario}, '${row.usuario}')" class="btn btn-primary">Cambiar Clave</button>
                        <button onclick="eliminarUsuario(${row.idUsuario})" class="btn btn-danger">Eliminar</button>
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

const obtenerRoles = async () => {
    try {
        const selectRol = document.getElementById("rol");
        selectRol.innerHTML = `<option value="0" selected>Selecciona...</option>`;
        const response = await fetchData(API_ROL, "GET", obtenerHeaders());

        if (response) {
            response.forEach(area => {
                const option = document.createElement("option");
                option.value = area.idRol;
                option.textContent = area.nombre;
                selectRol.appendChild(option);
            });
        }
    } catch (error) {
        showError(error);
    }
};

const postUsuario = async () => {
    try {
        const nombreCompleto = document.getElementById("nombreCompleto")?.value.trim();
        const telefonoPersonal = document.getElementById("telefonoPersonal")?.value.trim();
        const telefonoCorporativo = document.getElementById("telefonoCorporativo")?.value.trim();
        const direccion = document.getElementById("direccion")?.value.trim();
        const correoElectronico = document.getElementById("correoElectronico")?.value.trim();
        const idArea = document.getElementById("area")?.value.trim();
        const idUsuario = document.getElementById("idUsuario")?.value.trim();
        const usuario = document.getElementById("usuario")?.value.trim();
        const clave = document.getElementById("clave")?.value.trim();
        const rol = document.getElementById("rol")?.value.trim(); // ID del rol seleccionado

        // Validación de campos
        if (!nombreCompleto || !telefonoPersonal || !telefonoCorporativo || !direccion ||
            !correoElectronico || !idArea || !usuario || !clave || !rol) {
            showError("Todos los campos son obligatorios.");
            return;
        }

        // Formatear la fecha de creación para el objeto `auth`
        const fechaCreacion = new Date().toISOString();

        // Construcción del objeto en el formato esperado por la API
        const usuarioConAuthData = {
            usuario: {
                idUsuario: 0, // Se asignará en el backend
                nombreCompleto,
                telefonoPersonal,
                telefonoCorporativo,
                direccion,
                correoElectronico,
                idArea: parseInt(idArea, 10),
                estado: true
            },
            auth: {
                idAuth: 0, // Se asignará en el backend
                usuario,
                clave,
                fechaCreacion, // Se envía en formato ISO 8601
                idRol: parseInt(rol, 10),
                idUsuario: 0, // Se asignará en el backend
                estado: true
            }
        };

        // Enviar la solicitud con ambos objetos en un solo `POST`
        const response = await sendData(API_USUARIOS, "POST", usuarioConAuthData, obtenerHeaders());

        if (response && response.code === 201) {
            showSuccess("Usuario y credenciales creados exitosamente.");
            cargarFuncionesUsuarios();
        } else {
            showError(response?.message || "Error al crear usuario y credenciales.");
        }

    } catch (error) {
        showError("Error al registrar el usuario: " + error);
    }
};

window.editarUsuario = function (row) {
    document.getElementById("idUsuario").value = row.idUsuario;
    document.getElementById("nombreCompleto").value = row.nombreCompleto;
    document.getElementById("telefonoPersonal").value = row.telefonoPersonal;
    document.getElementById("telefonoCorporativo").value = row.telefonoCorporativo;
    document.getElementById("direccion").value = row.direccion;
    document.getElementById("correoElectronico").value = row.correoElectronico;
    document.getElementById("area").value = row.idArea;
    document.getElementById("rol").value = row.idRol;
    document.getElementById("usuario").value = row.usuario;
    document.getElementById("usuario").disabled = true;
    document.getElementById("clave").disabled = true;
};

const putUsuario = async () => {
    try {
        const data = {
            idUsuario: document.getElementById("idUsuario").value,
            nombreCompleto: document.getElementById("nombreCompleto").value,
            telefonoPersonal: document.getElementById("telefonoPersonal").value,
            telefonoCorporativo: document.getElementById("telefonoCorporativo").value,
            direccion: document.getElementById("direccion").value,
            correoElectronico: document.getElementById("correoElectronico").value,
            idArea: document.getElementById("area").value,
            estado: true,
            usuario: document.getElementById("usuario").value,
            idRol: document.getElementById("rol").value
        };

        if (Object.values(data).some(value => value === "" || value === null || value === undefined)) {
            showError("Todos los campos son obligatorios.");
            return;
        }

        const response = await sendData(API_USUARIOS, "PUT", data, obtenerHeaders());

        if (response && response.code === 200) {
            showSuccess("Usuario actualizado correctamente.");
            cargarFuncionesUsuarios();
        }
    } catch (error) {
        showError("Error al actualizar el usuario: " + error);
    }
};

window.cambiarClave = function (idUsuario, usuario) {
    document.getElementById("idUsuarioEditar").value = idUsuario;
    document.getElementById("usuarioEditar").value = usuario;
    let modal = new bootstrap.Modal(document.getElementById("exampleModal"));
    modal.show();
};

const putCambiarClave = async () => {
    try {
        const idUsuario = document.getElementById("idUsuarioEditar").value;
        const usuario = document.getElementById("usuarioEditar").value;
        const nuevaClave = document.getElementById("claveEditar").value.trim();

        if (!idUsuario || !usuario || !nuevaClave) {
            showError("Todos los campos son obligatorios.");
            return;
        }

        const data = {
            idUsuario: parseInt(idUsuario),
            usuario: usuario,
            nuevaClave: nuevaClave
        };

        const response = await sendData(API_AUTH_CAMBIARCLAVE, "PUT", data, obtenerHeaders());

        if (response && response.code === 200) {
            let modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
            modal.hide();
            showSuccess("Contraseña actualizada correctamente.");
        } else {
            showError(response.message);
        }
    } catch (error) {
        showError("Error al actualizar la contraseña: " + error);
    }
};

window.eliminarUsuario = async (idUsuario) => {
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
            const response = await fetchData(`${API_USUARIOS}/${idUsuario}`, "DELETE", obtenerHeaders());

            if (response && response.code === 200) {
                showSuccess("Usuario eliminado correctamente.");
                cargarFuncionesUsuarios();
            } else {
                showError("No se pudo eliminar el usuario.");
            }
        } catch (error) {
            showError("Error al eliminar el usuario: " + error);
        }
    }
};

const limpiar = function () {
    document.getElementById("idUsuario").value = '';
    document.getElementById("idUsuarioEditar").value = '';
    document.getElementById("nombreCompleto").value = '';
    document.getElementById("telefonoPersonal").value = '';
    document.getElementById("telefonoCorporativo").value = '';
    document.getElementById("direccion").value = '';
    document.getElementById("correoElectronico").value = '';
    document.getElementById("area").selectedIndex = 0;
    document.getElementById("rol").selectedIndex = 0;
    document.getElementById("usuario").value = '';
    document.getElementById("clave").value = '';
    document.getElementById("usuarioEditar").value = '';
    document.getElementById("claveEditar").value = '';
    document.getElementById("usuario").disabled = false;
    document.getElementById("clave").disabled = false;
}

const cargarFuncionesUsuarios = function () {
    obtenerUsuarios();
    obtenerAreas();
    obtenerRoles();
    limpiar();
};


const redirigirA401 = () => {
    window.location.href = "../../../src/views/pages/401.html";
};

const manejarGuardarUsuario = () => {
    const idUsuario = document.getElementById("idUsuario")?.value?.trim();
    if (!idUsuario || isNaN(idUsuario)) {
        postUsuario();
    } else {
        putUsuario();
    }
};


const eventos = [
    {id: "closeSession", callback: closeSession},
    {id: "limpiar", callback: limpiar},
    {id: "putCambiarClave", callback: putCambiarClave},
    {id: "guardarEditar", callback: manejarGuardarUsuario},
    {id: "guardarCambioClave", callback: putCambiarClave}
];


document.addEventListener("DOMContentLoaded", async () => {
    try {
        if (!validarSesion()) return;
        await manejarValidacionToken();
        inicializarEventos();
    } catch (error) {
        console.error("Error en la inicialización:", error);
    }
});


const validarSesion = () => {
    const token = sessionStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
        redirigirA401();
        return false;
    }
    return true;
};

const manejarValidacionToken = async () => {
    try {
        const token = sessionStorage.getItem("token");
        const esValido = await verificarToken(token);
        if (!esValido) {
            sessionStorage.removeItem("token");
            redirigirA401();
        } else {
            cargarFuncionesUsuarios();
        }
    } catch (error) {
        console.error("Error al validar el token:", error);
        sessionStorage.removeItem("token");
        redirigirA401();
    }
};


const inicializarEventos = () => {
    eventos.forEach(({id, callback}) => asignarEvento(id, callback));
};


const asignarEvento = (idElemento, callback) => {
    const elemento = document.getElementById(idElemento);
    if (elemento) {
        elemento.addEventListener("click", callback);
    }
};
