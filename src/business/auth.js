import { 
    API_URL_BASE, 
    API_AREAS, 
    API_ASIGNACIONES,
    API_AUTH_LOGIN,
    API_AUTH_REGISTER,
    API_AUTH_VALIDARTOKEN,
    API_FINALIZACIONES,
    API_GRUPOS,
    API_GRUPOUSUARIOS,
    API_MAQUINAS,
    API_MENU,
    API_PLANTAS,
    API_REPORTES,
    API_ROL,
    API_TIPOMAQUINAS,
    API_USUARIOS
} from '../config/settings.js';

import { fetchData, sendData } from '../utils/apiMethods.js';

// Ejemplo de GET (Obtener usuarios)
async function obtenerUsuarios() {
    const usuarios = await fetchData(API_USUARIOS);
    console.log("Usuarios:", usuarios);
}
obtenerUsuarios();