document.addEventListener("DOMContentLoaded", function() {
    // 1. Cargar el Header y luego inicializar sus funciones
    fetch("components/header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
            
            // --- AGREGA ESTO AQUÍ ---
            inicializarMenuHamburguesa(); 
            // ------------------------
            
            actualizarIconoTema();
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
        // --- AQUÍ YA MANEJAS EL MODO OSCURO, AHORA SUMAMOS EL MENÚ ---
        
        // Manejo del botón de Hamburguesa
        const hamburgerBtn = e.target.closest("#hamburger-btn");
        if (hamburgerBtn) {
            const mobileMenu = document.getElementById("mobile-menu");
            if (mobileMenu) {
                mobileMenu.classList.toggle("hidden");
                const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
                hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
            }
        }

        // Manejo del botón de Modo Oscuro
        const toggleBtn = e.target.closest("#theme-toggle");
        if (toggleBtn) {
            document.documentElement.classList.toggle("dark");
            localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
            actualizarIconoTema();
        }
    });
});
