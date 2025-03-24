// Para GET y Delete sin Token
async function fetchData(url, method, headers = {}) {
    // Intentar obtener el token del sessionStorage
    const token = sessionStorage.getItem("token");

    // Si hay token, agregarlo a los headers
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method,
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            ...headers
        },
    });

    if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;

        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            errorMessage = await response.text();
        }

        throw new Error(errorMessage);
    }

    // Si la respuesta es 204 No Content o DELETE, no intentamos parsear JSON
    if (response.status === 204) {
        return null;
    }

    return await response.json();
}


// Para POST y PUT
async function sendData(url, method, data, headers = {}) {
    // Intentar obtener el token del sessionStorage
    const token = sessionStorage.getItem("token");

    // Si hay token, agregarlo a los headers
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method,
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            ...headers
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        let errorMessage = "Error en la petición.";

        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            errorMessage = await response.text();
        }

        throw new Error(errorMessage);
    }

    return await response.json();
}


// Para validar el token
async function fetchDataToken(url, method, headers = {}) {
    const response = await fetch(url, {
        method,
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            ...headers
        },
    });

    // Leer el JSON una sola vez
    let responseData;
    try {
        responseData = await response.json();
    } catch {
        responseData = null;
    }

    if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;

        if (responseData && responseData.message) {
            errorMessage = responseData.message;
        }

        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return responseData;
}


// Exportar funciones
export { fetchData, sendData, fetchDataToken };