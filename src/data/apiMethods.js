// Para GET y Delete
async function fetchData(url, method) {
    const response = await fetch(url, {
        method,
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
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

    // Si la respuesta es 204 No Content, no intentamos parsear JSON
    if (response.status === 204 || method === "DELETE") {
        return null;
    }

    return await response.json();
}


// Para POST y PUT
async function sendData(url, method, data) {
    const response = await fetch(url, {
        method,
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        let errorMessage = 'Error en la petición.';

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
            ...headers // Asegurar que los headers personalizados se incluyan correctamente
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

    if (response.status === 204 || method === "DELETE") {
        return null;
    }

    return responseData;
}


// Exportar funciones
export { fetchData, sendData, fetchDataToken };