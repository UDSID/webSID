document.addEventListener("DOMContentLoaded", function() {
    // 1. Cargar el Header y luego inicializar sus funciones
    //    Ruta ABSOLUTA (empieza con "/webSID/") para que funcione sin importar
    //    si la página está en la raíz o en una subcarpeta
    fetch("/webSID/components/header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
            
            // Actualizar el icono según el tema actual al cargar
            actualizarIconoTema();
            
            // Resaltar automáticamente el enlace de la página activa
            highlightActiveLink();
        });

    // 2. Cargar el Footer (misma razón: ruta absoluta)
    fetch("/webSID/components/footer.html")
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
    
    // Si estamos en la raíz del repositorio (ej: github.io/webSID o github.io/webSID/)
    if (page === "" || page === "webSID" || !page.includes(".html")) {
        page = "index.html";
    }
    
    // Solo seleccionamos los enlaces del menú de navegación, ignorando el logo
    const navLinks = document.querySelectorAll('#nav-desktop a, #mobile-menu a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute("href");
        
        // Extraemos solo el nombre del archivo del enlace (ej: "actividades.html")
        const linkPage = linkHref ? linkHref.split('/').pop() : '';
        
        if (linkPage === page) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}
