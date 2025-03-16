import { verificarToken } from '../utils/tokenValidation.js';
import { API_AREAS, API_PLANTAS } from '../config/settings.js';
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

const obtenerAreas = async () => {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            closeSession();
        }
        const headers = {
            "Authorization": `Bearer ${token}`
        };
        const response = await fetchData(API_AREAS, "GET", headers);

        if (response) {
            // Inicializar DataTable con los nombres correctos de las columnas
            $('#tabla-datos-dinamicos').DataTable({
                destroy: true, // Permite reinicializar la tabla sin errores
                data: response,   // Carga los datos dinámicos
                columns: [
                    { data: "idArea" },       // Se cambia 'id' por 'idArea'
                    { data: "nombre" },
                    { data: "ubicacion" },
                    { data: "idPlanta" },     // Se cambia 'planta' por 'idPlanta'
                    { data: "descripcion" },
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
        }
        else {
            return;
        }
    } catch (error) {
        showError(error || "Error al obtener las áreas.");
        return;
    }
}

const obtenerPlantas = async () => {
    try {
        const token = sessionStorage.getItem("token");
        const selectPlanta = document.getElementById("planta");
        selectPlanta.innerHTML = `<option value="0" selected>Selecciona...</option>`;

        if (!token) {
            closeSession();
        }
        const headers = {
            "Authorization": `Bearer ${token}`
        };
        const response = await fetchData(API_PLANTAS, "GET", headers);

        if (response) {
            response.forEach(planta => {
                const option = document.createElement("option");
                option.value = planta.idPlanta;
                option.textContent = planta.nombre + ' - ' + planta.descripcion;
                selectPlanta.appendChild(option);
            });
        }
        if (response.length === 0) {
            selectPlanta.innerHTML += `<option disabled>No hay plantas disponibles</option>`;
        }
    } catch (error) {
        showError(error);
    }
}


const postAreas = async () => {
    try {
        const token = sessionStorage.getItem("token");
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

        const headers = {
            "Authorization": `Bearer ${token}`
        };
        const response = await sendData(API_AREAS, "POST", data, headers);

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
        const token = sessionStorage.getItem("token");
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

        const headers = {
            "Authorization": `Bearer ${token}`
        };
        const response = await sendData(API_AREAS, "PUT", data, headers);

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
            const token = sessionStorage.getItem("token");
            const headers = {
                "Authorization": `Bearer ${token}`
            };
            const response = await fetchData(`${API_AREAS}/${idArea}`, "DELETE", headers);

            if (response && response.code === 200) {
                showSuccess("Área eliminada correctamente.");
                obtenerAreas(); // Actualizar la tabla después de eliminar
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
    limpiar();
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = sessionStorage.getItem("token"); // Obtener token del almacenamiento
        const closeSessionButton = document.getElementById("closeSession");
        const areaButton = document.getElementById("guardarArea");
        const limpiarButton = document.getElementById("limpiarArea");

        if (!token) {
            window.location.href = "../../../src/views/pages/401.html";
            return;
        }

        const esValido = await verificarToken(token); // Validar token

        if (!esValido) {
            sessionStorage.removeItem("token");
            window.location.href = "../../../src/views/pages/401.html";
            return;
        }

        cargarTodasLasFuncionesGet();

        // Si trae el ID area ejecuta PUT para actualizar, si no, ejecuta POST
        if (areaButton) {
            areaButton.addEventListener("click", () => {
                const idArea = document.getElementById("idArea").value.trim();
                if (idArea) {
                    putAreas(); // Ejecuta actualización si hay un ID
                } else {
                    postAreas(); // Ejecuta inserción si el ID está vacío
                }
            });
        }

        if(limpiarButton){
            limpiarButton.addEventListener("click", limpiar);
        }

        if (closeSessionButton) {
            closeSessionButton.addEventListener("click", closeSession);
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
});