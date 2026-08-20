/**
 * inscripciones.js
 * Carga únicamente actividades/cursos sin link externo y procesa el registro a Google Forms.
 */

// 1. URL corregida apuntando al endpoint de respuesta (/formResponse)
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd66XDwMcJFsbVH2AU4edlO3B_pO8FclqpdhPhWli3EiQZ43Q/formResponse";

// 2. Mapeo de campos entry de Google Forms
const ENTRY_NOMBRE    = "entry.1395501251";  // Campo 1: Nombre Completo
const ENTRY_CODIGO    = "entry.428005147"; // Campo 2: Código Estudiantil
const ENTRY_CORREO    = "entry.2106083925"; // Campo 3: Correo Institucional / Personal
const ENTRY_ACTIVIDAD = "entry.987096053";  // Campo 4: Actividad / Curso

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inscripcion-form');
    if (!form) return;

    const nombreInput     = document.getElementById('nombre');
    const codigoInput     = document.getElementById('codigo');
    const correoInput     = document.getElementById('correo');
    const actividadSelect = document.getElementById('actividad');

    const nombreError     = document.getElementById('nombre-error');
    const codigoError     = document.getElementById('codigo-error');
    const correoError     = document.getElementById('correo-error');
    const actividadError  = document.getElementById('actividad-error');

    const submitBtn       = document.getElementById('submit-btn');
    const submitIcon      = document.getElementById('submit-icon');
    const submitText      = document.getElementById('submit-text');
    const successModal    = document.getElementById('success-modal');
    const closeModalBtn   = document.getElementById('close-modal-btn');

    const CORREO_REGEX = /^[a-zA-Z0-9._%+-]+@(udistrital\.edu\.co|gmail\.com)$/i;
    const CODIGO_REGEX = /^\d{7,11}$/;

    // --------------------------------------------------------------------------
    // Carga y Filtrado de Actividades
    // --------------------------------------------------------------------------
    async function cargarActividades() {
        const rutasJSON = ['archivos_json/eventos.json', 'eventos.json', 'eventos_2.json'];
        let data = null;

        for (const ruta of rutasJSON) {
            try {
                const response = await fetch(ruta);
                if (response.ok) {
                    data = await response.json();
                    break;
                }
            } catch (err) {
                console.warn(`No se pudo cargar desde ${ruta}:`, err);
            }
        }

        if (!data) {
            actividadSelect.innerHTML = `<option value="" disabled selected>Error al cargar actividades</option>`;
            return;
        }

        const listaEventos = Array.isArray(data) ? data : (data.actividades || []);

        // Filtra únicamente las actividades sin enlace externo, y excluye además
        // aquellas cuyo estado sea "en curso" o "terminado" (equivalente), ya que
        // dichas actividades ya no deben aparecer como opción de inscripción.
        const eventosSinLink = listaEventos.filter(act => {
            const sinLink = !act.link || act.link.trim() === "";
            const estadoNormalizado = (act.estado || '').toLowerCase().replace('_', ' ');
            const esEstadoExcluido = estadoNormalizado.includes('curso')
                || estadoNormalizado.includes('terminad')
                || estadoNormalizado.includes('finalizada');
            return sinLink && !esEstadoExcluido;
        });

        poblarOpciones(eventosSinLink);
    }

    function poblarOpciones(actividades) {
        actividadSelect.innerHTML = '';

        if (actividades.length === 0) {
            actividadSelect.innerHTML = `<option value="" disabled selected>No hay actividades con inscripción disponible actualmente.</option>`;
            return;
        }

        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.disabled = true;
        defaultOpt.selected = true;
        defaultOpt.textContent = '-- Selecciona una actividad --';
        actividadSelect.appendChild(defaultOpt);

        actividades.forEach(act => {
            const option = document.createElement('option');
            option.value = act.titulo; // Envía el texto exacto de la opción a Google Forms
            option.textContent = act.titulo;
            actividadSelect.appendChild(option);
        });

        // Preselección por parámetro URL (?evento=act-02)
        const urlParams = new URLSearchParams(window.location.search);
        const eventoParam = urlParams.get('evento');
        if (eventoParam) {
            const eventoEncontrado = actividades.find(act => act.id === eventoParam);
            if (eventoEncontrado) {
                actividadSelect.value = eventoEncontrado.titulo;
            }
        }
    }

    // --------------------------------------------------------------------------
    // Validaciones
    // --------------------------------------------------------------------------
    function validarNombre() {
        const esValido = nombreInput.value.trim().length >= 3;
        toggleError(nombreInput, nombreError, esValido);
        return esValido;
    }

    function validarCodigo() {
        const esValido = CODIGO_REGEX.test(codigoInput.value.trim());
        toggleError(codigoInput, codigoError, esValido);
        return esValido;
    }

    function validarCorreo() {
        const esValido = CORREO_REGEX.test(correoInput.value.trim());
        toggleError(correoInput, correoError, esValido);
        return esValido;
    }

    function validarActividad() {
        const esValido = actividadSelect.value !== '';
        toggleError(actividadSelect, actividadError, esValido);
        return esValido;
    }

    function toggleError(inputElement, errorElement, esValido) {
        if (!errorElement) return;
        inputElement.classList.toggle('border-pink-500', !esValido);
        errorElement.classList.toggle('hidden', esValido);
    }

    nombreInput.addEventListener('blur', validarNombre);
    codigoInput.addEventListener('blur', validarCodigo);
    correoInput.addEventListener('blur', validarCorreo);
    actividadSelect.addEventListener('change', validarActividad);

    // --------------------------------------------------------------------------
    // Envío Asíncrono
    // --------------------------------------------------------------------------
    async function enviarFormularioGoogle(datos) {
        const formData = new URLSearchParams();
        formData.append(ENTRY_NOMBRE, datos.nombre);
        formData.append(ENTRY_CODIGO, datos.codigo);
        formData.append(ENTRY_CORREO, datos.correo);
        formData.append(ENTRY_ACTIVIDAD, datos.actividad);

        try {
            await fetch(GOOGLE_FORM_URL, {
                method: "POST",
                mode: "no-cors", // Evita bloqueos de CORS
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
            });
            return true;
        } catch (error) {
            console.error("Error al enviar a Google Forms:", error);
            return false;
        }
    }

    // --------------------------------------------------------------------------
    // Evento Submit
    // --------------------------------------------------------------------------
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const v1 = validarNombre();
        const v2 = validarCodigo();
        const v3 = validarCorreo();
        const v4 = validarActividad();

        if (!v1 || !v2 || !v3 || !v4) return;

        submitBtn.disabled = true;
        if (submitIcon) submitIcon.textContent = 'hourglass_top';
        if (submitText) submitText.textContent = 'Enviando...';

        const datos = {
            nombre: nombreInput.value.trim(),
            codigo: codigoInput.value.trim(),
            correo: correoInput.value.trim(),
            actividad: actividadSelect.value
        };

        const exito = await enviarFormularioGoogle(datos);

        if (exito) {
            form.reset();
            if (successModal) successModal.classList.remove('hidden');
        } else {
            alert("Ocurrió un error al procesar el registro. Inténtalo de nuevo.");
        }

        submitBtn.disabled = false;
        if (submitIcon) submitIcon.textContent = 'send';
        if (submitText) submitText.textContent = 'Confirmar Inscripción';
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            successModal.classList.add('hidden');
            window.location.href = 'actividades.html';
        });
    }

    cargarActividades();
});