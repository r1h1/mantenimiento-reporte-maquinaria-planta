// Función reutilizable para GET y DELETE
async function fetchData(url, method = "GET") {
    try {
        const response = await fetch(url, {
            method,
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${method}: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        return;
    }
}

// Función reutilizable para POST y PUT
async function sendData(url, method, data) {
    try {
        const response = await fetch(url, {
            method,
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error ${method}: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        return;
    }
}

// Exportar funciones
export { fetchData, sendData };