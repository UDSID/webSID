document.addEventListener("DOMContentLoaded", function() {
    // 1. Cargar el Header y luego inicializar sus funciones
    fetch("components/header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
            
            // Actualizar el icono según el tema actual al cargar
            actualizarIconoTema();
            
            // Resaltar automáticamente el enlace de la página activa
            highlightActiveLink();
        });

    // 2. Cargar el Footer
    fetch("components/footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-container").innerHTML = data;
        });

    // 3. Controlador del Modo Oscuro usando Delegación de Eventos
    document.addEventListener("click", function(e) {
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

    // Si la ruta está vacía o apunta a la raíz, asumimos index.html
    if (page === "" || page === "/") {
        page = "index.html";
    }

    // Seleccionar todos los enlaces dentro del header cargado
    const navLinks = document.querySelectorAll('#header-container a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute("href");
        
        // Comprobar si el href coincide con el archivo actual
        if (linkHref === page) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}