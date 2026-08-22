document.addEventListener("DOMContentLoaded", function() {
    // 1. Cargar el Header y luego inicializar sus funciones
    //    Ruta ABSOLUTA (empieza con "/") para que funcione sin importar
    //    si la página está en la raíz o en una subcarpeta
    //    (ej: /inscripcion competencias/inscripcion-competencias.html).
    fetch("/components/header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
            
            // Actualizar el icono según el tema actual al cargar
            actualizarIconoTema();
            
            // Resaltar automáticamente el enlace de la página activa
            highlightActiveLink();
        });

    // 2. Cargar el Footer (misma razón: ruta absoluta)
    fetch("/components/footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-container").innerHTML = data;
        });

    // 3. Controlador de eventos usando Delegación (Modo Oscuro + Menú Hamburguesa)
    document.addEventListener("click", function(e) {

        // Menú Hamburguesa
        const hamburgerBtn = e.target.closest("#hamburger-btn");
        if (hamburgerBtn) {
            const mobileMenu = document.getElementById("mobile-menu");
            if (mobileMenu) {
                mobileMenu.classList.toggle("hidden");
                const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
                hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
            }
        }

        // Verificar si el clic fue en el botón de cambiar tema o dentro de él
        const toggleBtn = e.target.closest("#theme-toggle");
        if (toggleBtn) {
            // Alternar la clase 'dark' en la etiqueta <html>
            document.documentElement.classList.toggle("dark");

            // Guardar la preferencia del usuario en el almacenamiento local
            if (document.documentElement.classList.contains("dark")) {
                localStorage.setItem("theme", "dark");
            } else {
                localStorage.setItem("theme", "light");
            }

            actualizarIconoTema();
        }
    });
});

// Función para cambiar el icono del botón (de luna a sol o viceversa)
function actualizarIconoTema() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    const iconSpan = toggleBtn.querySelector(".material-symbols-outlined");
    if (!iconSpan) return;
    if (document.documentElement.classList.contains("dark")) {
        iconSpan.textContent = "light_mode"; // Mostrar sol si estamos en oscuro
    } else {
        iconSpan.textContent = "dark_mode";  // Mostrar luna si estamos en claro
    }
}

// Función para detectar la página actual y agregar la clase 'active'
function highlightActiveLink() {
    const path = window.location.pathname;
    let page = path.split("/").pop();
    if (page === "" || page === "/") {
        page = "index.html";
    }
    const navLinks = document.querySelectorAll('#header-container a');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute("href");
        // Normaliza quitando la barra inicial ("/index.html" -> "index.html")
        // para que la comparación funcione ahora que los enlaces son absolutos.
        const linkPage = linkHref ? linkHref.replace(/^\//, '') : '';
        if (linkPage === page) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}