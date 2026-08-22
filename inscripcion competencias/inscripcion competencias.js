/* ==========================================================================
   INSCRIPCION-COMPETENCIAS.JS
   Script aislado exclusivo de inscripcion-competencias.html.
   Gestiona:
     1. Configuración de integración con Google Forms.
     2. Selección dinámica de categorías según la competencia escogida.
     3. Alta/baja dinámica de integrantes (1 a 3) en formato carrusel.
     4. Validación completa de campos y envío asíncrono con feedback visual.
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. CONFIGURACIÓN: URL del Google Form y mapeo de entry.XXXXXXXXX
// --------------------------------------------------------------------------
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeUUmW1OTetjuMHz_aw7qClwR6rPLqCUvYXcy77YG28aOz7nQ/formResponse";

const ENTRY_COMPETENCIA = "entry.325091311"; // Competencia seleccionada
const ENTRY_CATEGORIA = "entry.141401132";   // Categoría seleccionada (Niveles o Niveles de Maratón)
const ENTRY_NOMBRE_EQUIPO = "entry.1888574681"; // Nombre del equipo

const ENTRIES_INTEGRANTES = {
    1: {
        nombre: "entry.1229385714",
        codigo: "entry.1003504626",
        correo: "entry.1585354195"
    },
    2: {
        nombre: "entry.1668319542",
        codigo: "entry.1922365136",
        correo: "entry.1378048489"
    },
    3: {
        nombre: "entry.1375317591",
        codigo: "entry.110608059",
        correo: "entry.63595057"
    }
};

// Reglas de validación
const CORREO_REGEX = /^[a-zA-Z0-9._%+-]+@(udistrital\.edu\.co|gmail\.com)$/i;
const CODIGO_REGEX = /^\d{7,11}$/;

const MIN_INTEGRANTES = 1;
const MAX_INTEGRANTES = 3;

// Definición de categorías según la competencia seleccionada
const categoriasPorCompetencia = {
    "Competencia de Bases de Datos": ["Nivel 1", "Nivel 2", "Nivel 3"],
    "Maratón de Programación": ["Básico", "Intermedio", "Avanzado", "Élite"]
};

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('inscripcion-form');
    if (!form) return;

    const competenciaError = document.getElementById('competencia-error');
    
    // Referencias para el bloque dinámico de categorías
    const categoriaContainer = document.getElementById('categoria-container');
    const categoriaGroup = document.getElementById('categoria-group');
    const categoriaError = document.getElementById('categoria-error');

    const nombreEquipoInput = document.getElementById('nombre-equipo');
    const nombreEquipoError = document.getElementById('nombre-equipo-error');

    const integrantesTrack = document.getElementById('integrantes-track');
    const btnAnadir = document.getElementById('btn-anadir-integrante');
    const contador = document.getElementById('integrantes-contador');
    const btnPrev = document.getElementById('integrante-prev-btn');
    const btnNext = document.getElementById('integrante-next-btn');
    const dots = document.querySelectorAll('#integrantes-dots .integrante-dot');

    const submitBtn = document.getElementById('submit-btn');
    const submitIcon = document.getElementById('submit-icon');
    const submitText = document.getElementById('submit-text');

    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    let integrantesActivos = MIN_INTEGRANTES;
    let slideActual = MIN_INTEGRANTES;

    // ------------------------------------------------------------------
    // 2. GESTIÓN DINÁMICA DE CATEGORÍAS SEGÚN COMPETENCIA
    // ------------------------------------------------------------------
    const competenciaRadios = form.querySelectorAll('input[name="competencia"]');
    competenciaRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const competenciaSeleccionada = e.target.value;
            const opciones = categoriasPorCompetencia[competenciaSeleccionada] || [];

            // Limpiar opciones anteriores e inyectar las nuevas
            categoriaGroup.innerHTML = '';
            opciones.forEach(cat => {
                const label = document.createElement('label');
                label.className = 'cursor-pointer';
                label.innerHTML = `
                    <input type="radio" name="categoria" value="${cat}" required class="peer sr-only">
                    <span class="inline-block px-5 py-2 rounded-full text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 peer-checked:bg-sky-500 peer-checked:border-sky-500 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500 transition-all">
                        ${cat}
                    </span>
                `;
                categoriaGroup.appendChild(label);
            });

            // Mostrar el contenedor de categorías de forma fluida
            categoriaContainer.classList.remove('hidden');
            categoriaError.classList.add('hidden');
            competenciaError.classList.add('hidden');
        });
    });

    // ------------------------------------------------------------------
    // 3. GESTIÓN DINÁMICA DE INTEGRANTES Y CARRUSEL
    // ------------------------------------------------------------------
    function actualizarInterfazIntegrantes() {
        for (let n = 1; n <= MAX_INTEGRANTES; n++) {
            const tarjeta = integrantesTrack.querySelector(`.integrante-slide[data-integrante="${n}"]`);
            if (!tarjeta) continue;

            const estaActivo = n <= integrantesActivos;
            const inputs = tarjeta.querySelectorAll('input');
            inputs.forEach(input => {
                input.required = estaActivo;
                if (!estaActivo) {
                    input.value = '';
                    input.classList.remove('border-pink-500');
                }
            });

            if (!estaActivo) {
                tarjeta.querySelectorAll('.campo-error').forEach(err => err.classList.add('hidden'));
            }

            const btnEliminar = tarjeta.querySelector('.btn-eliminar-integrante');
            if (btnEliminar) {
                btnEliminar.classList.toggle('hidden', n !== integrantesActivos);
            }
        }

        const seAlcanzoElMaximo = integrantesActivos >= MAX_INTEGRANTES;
        btnAnadir.classList.toggle('hidden', seAlcanzoElMaximo);
        btnAnadir.disabled = seAlcanzoElMaximo;
    }

    function actualizarCarrusel() {
        integrantesTrack.style.transform = `translateX(-${(slideActual - 1) * 100}%)`;
        contador.textContent = `Integrante ${slideActual} de ${integrantesActivos}`;

        btnPrev.disabled = slideActual <= 1;
        btnNext.disabled = slideActual >= integrantesActivos;

        dots.forEach(dot => {
            const n = parseInt(dot.dataset.slide, 10);
            dot.classList.toggle('hidden', n > integrantesActivos);
            dot.classList.toggle('active', n === slideActual);
        });
    }

    btnAnadir.addEventListener('click', () => {
        if (integrantesActivos >= MAX_INTEGRANTES) return;
        integrantesActivos += 1;
        actualizarInterfazIntegrantes();
        actualizarCarrusel();
    });

    integrantesTrack.addEventListener('click', (e) => {
        const btnEliminar = e.target.closest('.btn-eliminar-integrante');
        if (!btnEliminar) return;

        if (integrantesActivos <= MIN_INTEGRANTES) return;

        integrantesActivos -= 1;
        slideActual = integrantesActivos;
        actualizarInterfazIntegrantes();
        actualizarCarrusel();
    });

    btnPrev.addEventListener('click', () => {
        if (slideActual <= 1) return;
        slideActual -= 1;
        actualizarCarrusel();
    });

    btnNext.addEventListener('click', () => {
        if (slideActual >= integrantesActivos) return;
        slideActual += 1;
        actualizarCarrusel();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const n = parseInt(dot.dataset.slide, 10);
            if (n > integrantesActivos) return;
            slideActual = n;
            actualizarCarrusel();
        });
    });

    // ------------------------------------------------------------------
    // 4. VALIDACIONES
    // ------------------------------------------------------------------
    function mostrarError(inputId, esValido) {
        const input = document.getElementById(inputId);
        const error = document.querySelector(`.campo-error[data-error-for="${inputId}"]`);
        if (input) input.classList.toggle('border-pink-500', !esValido);
        if (error) error.classList.toggle('hidden', esValido);
    }

    function validarCompetencia() {
        const seleccionada = form.querySelector('input[name="competencia"]:checked');
        competenciaError.classList.toggle('hidden', !!seleccionada);
        return !!seleccionada;
    }

    function validarCategoria() {
        const seleccionada = form.querySelector('input[name="categoria"]:checked');
        categoriaError.classList.toggle('hidden', !!seleccionada);
        return !!seleccionada;
    }

    function validarNombreEquipo() {
        const esValido = nombreEquipoInput.value.trim().length >= 3;
        nombreEquipoInput.classList.toggle('border-pink-500', !esValido);
        nombreEquipoError.classList.toggle('hidden', esValido);
        return esValido;
    }

    nombreEquipoInput.addEventListener('blur', validarNombreEquipo);

    function validarIntegrante(n) {
        const nombre = document.getElementById(`nombre-${n}`);
        const codigo = document.getElementById(`codigo-${n}`);
        const correo = document.getElementById(`correo-${n}`);

        const nombreValido = nombre.value.trim().length >= 3;
        const codigoValido = CODIGO_REGEX.test(codigo.value.trim());
        const correoValido = CORREO_REGEX.test(correo.value.trim());

        mostrarError(`nombre-${n}`, nombreValido);
        mostrarError(`codigo-${n}`, codigoValido);
        mostrarError(`correo-${n}`, correoValido);

        return nombreValido && codigoValido && correoValido;
    }

    function validarTodosLosIntegrantes() {
        let todosValidos = true;
        for (let n = 1; n <= integrantesActivos; n++) {
            const valido = validarIntegrante(n);
            todosValidos = todosValidos && valido;
        }
        return todosValidos;
    }

    for (let n = 1; n <= MAX_INTEGRANTES; n++) {
        ['nombre', 'codigo', 'correo'].forEach(campo => {
            const input = document.getElementById(`${campo}-${n}`);
            if (!input) return;
            input.addEventListener('blur', () => validarIntegrante(n));
        });
    }

    // ------------------------------------------------------------------
    // 5. MODAL Y RESETEO
    // ------------------------------------------------------------------
    function setEstadoEnviando(enviando) {
        submitBtn.disabled = enviando;
        submitIcon.textContent = enviando ? 'hourglass_top' : 'send';
        submitText.textContent = enviando ? 'Enviando...' : 'Confirmar Inscripción';
    }

    function mostrarModalExito() {
        successModal.classList.remove('hidden');
    }

    function ocultarModalExito() {
        successModal.classList.add('hidden');
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', ocultarModalExito);
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) ocultarModalExito();
        });
    }

    function resetearFormulario() {
        form.reset();
        integrantesActivos = MIN_INTEGRANTES;
        slideActual = MIN_INTEGRANTES;
        actualizarInterfazIntegrantes();
        actualizarCarrusel();
        competenciaError.classList.add('hidden');
        categoriaContainer.classList.add('hidden');
        categoriaGroup.innerHTML = '';
        categoriaError.classList.add('hidden');
        nombreEquipoInput.classList.remove('border-pink-500');
        nombreEquipoError.classList.add('hidden');
    }

    // ------------------------------------------------------------------
    // 6. ENVÍO DEL FORMULARIO
    // ------------------------------------------------------------------
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const competenciaValida = validarCompetencia();
        const categoriaValida = validarCategoria();
        const nombreEquipoValido = validarNombreEquipo();
        const integrantesValidos = validarTodosLosIntegrantes();

        if (!competenciaValida || !categoriaValida || !nombreEquipoValido || !integrantesValidos) {
            const primerInvalido = form.querySelector('.border-pink-500');
            if (primerInvalido) {
                primerInvalido.focus();
            } else if (!competenciaValida) {
                document.getElementById('competencia-group').scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (!categoriaValida) {
                categoriaContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const competenciaSeleccionada = form.querySelector('input[name="competencia"]:checked');
        const categoriaSeleccionada = form.querySelector('input[name="categoria"]:checked');

        const datos = new URLSearchParams();
        datos.append(ENTRY_COMPETENCIA, competenciaSeleccionada.value);
        datos.append(ENTRY_CATEGORIA, categoriaSeleccionada.value);
        datos.append(ENTRY_NOMBRE_EQUIPO, nombreEquipoInput.value.trim());

        for (let n = 1; n <= integrantesActivos; n++) {
            const entradas = ENTRIES_INTEGRANTES[n];
            datos.append(entradas.nombre, document.getElementById(`nombre-${n}`).value.trim());
            datos.append(entradas.codigo, document.getElementById(`codigo-${n}`).value.trim());
            datos.append(entradas.correo, document.getElementById(`correo-${n}`).value.trim());
        }

        setEstadoEnviando(true);

        fetch(GOOGLE_FORM_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: datos.toString()
        })
            .then(() => {
                mostrarModalExito();
                resetearFormulario();
            })
            .catch((error) => {
                console.error('Error al enviar la inscripción a la competencia:', error);
                alert('Ocurrió un error al enviar la inscripción. Por favor intenta de nuevo.');
            })
            .finally(() => {
                setEstadoEnviando(false);
            });
    });

    actualizarInterfazIntegrantes();
    actualizarCarrusel();
});