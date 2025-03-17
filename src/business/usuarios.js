import { verificarToken } from '../utils/tokenValidation.js';
import { API_USUARIOS, API_AREAS } from '../config/settings.js';
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

const obtenerUsuarios = async () => {
    try {
        const response = await fetchData(API_USUARIOS, "GET", obtenerHeaders());

        if (response) {
            // Inicializar DataTable con los nombres correctos de las columnas
            $('#tabla-datos-dinamicos').DataTable({
                destroy: true, // Permite reinicializar la tabla sin errores
                data: response,   // Carga los datos dinámicos
                columns: [
                    { data: "idUsuario" },
                    { data: "nombreCompleto" },
                    { data: "telefonoPersonal" },
                    { data: "telefonoCorporativo" },
                    { data: "direccion" },
                    { data: "correoElectronico" },
                    { data: "idArea" },
                    {
                        data: null,
                        render: function (data, type, row) {
                            return `
                        <button onclick="editarUsuario(${JSON.stringify(row).replace(/'/g, "&#39;").replace(/"/g, "&quot;")})" class="btn btn-warning">Editar</button>
                        <button onclick="eliminarUsuario(${row.idUsuario})" class="btn btn-danger">Eliminar</button>
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

const postUsuario = async () => {
    try {
        const nombreCompleto = document.getElementById("nombreCompleto")?.value.trim();
        const telefonoPersonal = document.getElementById("telefonoPersonal")?.value.trim();
        const telefonoCorporativo = document.getElementById("telefonoCorporativo")?.value.trim();
        const direccion = document.getElementById("direccion")?.value.trim();
        const correoElectronico = document.getElementById("correoElectronico")?.value.trim();
        const idArea = document.getElementById("area")?.value.trim();

        // Validación de campos
        if (!nombreCompleto || !telefonoPersonal || !telefonoCorporativo 
            || !direccion || !correoElectronico || !idArea) {
            showError("Todos los campos son obligatorios.");
            return;
        }

        const data = {
            idUsuario: 0,
            nombreCompleto,
            telefonoPersonal,
            telefonoCorporativo,
            direccion,
            correoElectronico,
            idArea,
            estado: true
        };

        const response = await sendData(API_USUARIOS, "POST", data, obtenerHeaders());

        if (response && response.code === 201) {
            showSuccess(response.message);
            cargarFuncionesUsuarios();
        }
    } catch (error) {
        showError(error);
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
            estado: true
        };

        if (Object.values(data).some(value => !value)) {
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
    document.getElementById("nombreCompleto").value = '';
    document.getElementById("telefonoPersonal").value = '';
    document.getElementById("telefonoCorporativo").value = '';
    document.getElementById("direccion").value = '';
    document.getElementById("correoElectronico").value = '';
    document.getElementById("area").selectedIndex = 0;
}

const cargarFuncionesUsuarios = function () {
    obtenerUsuarios();
    obtenerAreas();
    limpiar();
};

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
    if (!token) {
        redirigirA401();
        return false;
    }
    return true;
};

const manejarValidacionToken = async () => {
    const token = sessionStorage.getItem("token");
    const esValido = await verificarToken(token);
    if (!esValido) {
        sessionStorage.removeItem("token");
        redirigirA401();
    } else {
        cargarFuncionesUsuarios();
    }
};

const inicializarEventos = () => {
    asignarEvento("closeSession", closeSession);
    asignarEvento("limpiar", limpiar);
    asignarEventoGuardarUsuario();
};

const asignarEvento = (idElemento, callback) => {
    const elemento = document.getElementById(idElemento);
    if (elemento) {
        elemento.addEventListener("click", callback);
    }
};

const asignarEventoGuardarUsuario = () => {
    const guardarButton = document.getElementById("guardarEditar");
    if (guardarButton) {
        guardarButton.addEventListener("click", manejarGuardarUsuario);
    }
};

const manejarGuardarUsuario = () => {
    const idUsuario = document.getElementById("idUsuario")?.value.trim();
    idUsuario ? putUsuario() : postUsuario();
};

const redirigirA401 = () => {
    window.location.href = "../../../src/views/pages/401.html";
};