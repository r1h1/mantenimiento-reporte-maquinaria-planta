import {verificarToken} from '../utils/tokenValidation.js';
import {API_AREAS, API_USUARIOS, API_GRUPOS, API_GRUPOUSUARIOS, API_ROL, API_MENU} from '../config/settings.js';
import {sendData, fetchData} from '../data/apiMethods.js';
import {showError} from "../utils/sweetAlert.js";

const closeSession = function () {
    try {
        sessionStorage.removeItem("token");
        window.location.href = "../../../index.html";
    } catch (error) {
        showError("Error al cerrar sesión:", error);
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



document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = sessionStorage.getItem("token"); // Obtener token del almacenamiento
        const closeSessionButton = document.getElementById("closeSession");

        obtenerRolPorToken();

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

        if (closeSessionButton) {
            closeSessionButton.addEventListener("click", closeSession);
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
});