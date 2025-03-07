document.addEventListener("DOMContentLoaded", function () {

    const menuBtn = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");

    if (!menuBtn || !sidebar || !content) {
        return;
    }

    menuBtn.addEventListener("click", function () {
        // Verifica si el sidebar está oculto
        if (sidebar.classList.contains("hidden")) {
            sidebar.style.transform = "translateX(0)"; // Muestra el sidebar
            sidebar.classList.remove("hidden");
            content.classList.remove("shift");
        } else {
            sidebar.style.transform = "translateX(-100%)"; // Oculta el sidebar
            sidebar.classList.add("hidden");
            content.classList.add("shift");
        }
    });
});