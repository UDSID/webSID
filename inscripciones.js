/* ==========================================================================
   INSCRIPCIONES.JS
   Script aislado exclusivo de inscripciones.html.
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. CONFIGURACIÓN: URL del Google Form y mapeo de entry.XXXXXXXXX
// --------------------------------------------------------------------------
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScYKaqmZK8Lk7DWnFCCPxaD6jz7oQCCK_hbPihpXU61yG3QQg/formResponse";
const ENTRY_NOMBRE  = "entry.702701702"; // Nombre Completo
const ENTRY_CODIGO  = "entry.962147924"; // Código
const ENTRY_CORREO  = "entry.317417082"; // Correo Institucional
const ENTRY_CREDITO = "entry.234971857"; // ¿Ya tienes el crédito?
const ENTRY_PENSUM  = "entry.1218243218"; // Pensum
const ENTRY_GRUPO   = "entry.1648895657"; // Grupo de trabajo (pensum antiguo)
const ENTRY_APORTE  = "entry.1513246612"; // ¿Qué puedes aportar al grupo?

// Regex de validación: solo se aceptan correos @udistrital.edu.co o @gmail.com
const CORREO_REGEX = /^[a-zA-Z0-9._%+-]+@(udistrital\.edu\.co|gmail\.com)$/i;

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================================
    // CONTROL DE ACTIVACIÓN
    // Cambiar entre "true" y "false" para activar y desactivar las inscripiones
    // ======================================================================
    const INSCRIPCIONES_ABIERTAS = true; 

    // Coloca el enlace de invitación de tu grupo/comunidad de WhatsApp
    const WHATSAPP_FORO_URL = "https://chat.whatsapp.com/DG2lJjWyTDB14OtOAap9zr?s=cl&p=a&ilr=1"; 

    const form = document.getElementById('inscripcion-form');
    if (!form) return;

    // Si las inscripciones están cerradas, muestra la tarjeta con la invitación
    if (!INSCRIPCIONES_ABIERTAS) {
        form.classList.add('hidden');
        
        const avisoCierre = document.createElement('div');
        avisoCierre.className = "bg-white dark:bg-[#121e28] border border-slate-200 dark:border-white/5 rounded-2xl p-8 text-center space-y-5 shadow-sm";
        avisoCierre.innerHTML = `
            <div class="w-16 h-16 mx-auto bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                <span class="material-symbols-outlined text-4xl">groups</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Inscripciones Próximamente</h2>
            <p class="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
                Las inscripciones aún no están abiertas. Únete a nuestro foro de WhatsApp para estar al tanto de la información de la universidad y saber en qué momento se habilitarán.
            </p>
            <a href="${WHATSAPP_FORO_URL}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all">
                <span class="material-symbols-outlined text-xl">chat</span>
                Unirme al Foro de WhatsApp
            </a>
        `;
        form.parentNode.insertBefore(avisoCierre, form);
        return;
    }

    const correoInput   = document.getElementById('correo');
    const correoError   = document.getElementById('correo-error');
    const pensumError   = document.getElementById('pensum-error');
    const pensumAntiguo = document.getElementById('pensum-antiguo');
    const pensumNuevo   = document.getElementById('pensum-nuevo');
    const grupoWrapper  = document.getElementById('grupo-wrapper');
    const grupoInput    = document.getElementById('grupo');

    const submitBtn  = document.getElementById('submit-btn');
    const submitIcon = document.getElementById('submit-icon');
    const submitText = document.getElementById('submit-text');

    const successModal  = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // ----------------------------------------------------------------------
    // 2. Mostrar/ocultar el campo "Grupo de trabajo" según el Pensum elegido
    // ----------------------------------------------------------------------
    function actualizarVisibilidadGrupo() {
        if (pensumAntiguo && pensumAntiguo.checked) {
            grupoWrapper.classList.remove('hidden');
        } else {
            grupoWrapper.classList.add('hidden');
            if (grupoInput) grupoInput.value = '';
        }
    }

    if (pensumAntiguo) pensumAntiguo.addEventListener('change', actualizarVisibilidadGrupo);
    if (pensumNuevo) pensumNuevo.addEventListener('change', actualizarVisibilidadGrupo);

    // ----------------------------------------------------------------------
    // 3. Validaciones
    // ----------------------------------------------------------------------
    function validarCorreo() {
        const valor = correoInput.value.trim();

        if (valor === '') {
            correoInput.classList.add('border-pink-500');
            correoError.innerHTML = '<span class="material-symbols-outlined text-sm leading-none">error</span> Por favor, ingresa tu correo institucional antes de enviar.';
            correoError.classList.remove('hidden');
            return false;
        }

        const esValido = CORREO_REGEX.test(valor);
        correoInput.classList.toggle('border-pink-500', !esValido);
        
        if (!esValido) {
            correoError.innerHTML = '<span class="material-symbols-outlined text-sm leading-none">error</span> Ingresa un correo válido terminado en @udistrital.edu.co o @gmail.com';
            correoError.classList.remove('hidden');
        } else {
            correoError.classList.add('hidden');
        }

        return esValido;
    }

    function validarPensum() {
        const seleccionado = form.querySelector('input[name="pensum"]:checked');
        pensumError.classList.toggle('hidden', !!seleccionado);
        return !!seleccionado;
    }

    correoInput.addEventListener('blur', validarCorreo);
    correoInput.addEventListener('input', () => {
        if (!correoError.classList.contains('hidden')) validarCorreo();
    });

    // ----------------------------------------------------------------------
    // 4. Estado visual del botón de envío
    // ----------------------------------------------------------------------
    function setEstadoEnviando(enviando) {
        submitBtn.disabled = enviando;
        if (enviando) {
            submitIcon.textContent = 'hourglass_top';
            submitText.textContent = 'Enviando...';
        } else {
            submitIcon.textContent = 'send';
            submitText.textContent = 'Enviar Inscripción';
        }
    }

    // ----------------------------------------------------------------------
    // 5. Modal de éxito
    // ----------------------------------------------------------------------
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

    // ----------------------------------------------------------------------
    // 6. Envío del formulario
    // ----------------------------------------------------------------------
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const correoValido = validarCorreo();
        const pensumValido = validarPensum();
        const formularioValido = form.checkValidity();

        if (!correoValido || !pensumValido || !formularioValido) {
            if (!correoValido) {
                correoInput.focus();
            } else {
                form.reportValidity();
            }
            return;
        }

        const creditoSeleccionado = form.querySelector('input[name="credito"]:checked');
        const pensumSeleccionado = form.querySelector('input[name="pensum"]:checked');

        const datos = new URLSearchParams();
        datos.append(ENTRY_NOMBRE, document.getElementById('nombre').value.trim());
        datos.append(ENTRY_CODIGO, document.getElementById('codigo').value.trim());
        datos.append(ENTRY_CORREO, correoInput.value.trim());
        datos.append(ENTRY_CREDITO, creditoSeleccionado ? creditoSeleccionado.value : '');
        datos.append(ENTRY_PENSUM, pensumSeleccionado ? pensumSeleccionado.value : '');
        datos.append(ENTRY_GRUPO, grupoInput ? grupoInput.value.trim() : '');
        datos.append(ENTRY_APORTE, document.getElementById('aporte').value.trim());

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
            form.reset();
            grupoWrapper.classList.add('hidden');
            correoInput.classList.remove('border-pink-500');
            correoError.classList.add('hidden');
            pensumError.classList.add('hidden');
        })
        .catch((error) => {
            console.error('Error al enviar la inscripción:', error);
            alert('Ocurrió un error al enviar tu inscripción. Por favor intenta de nuevo.');
        })
        .finally(() => {
            setEstadoEnviando(false);
        });
    });

});