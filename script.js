document.addEventListener('DOMContentLoaded', () => {
// ==========================================================================
    // MÓDULO 1: NAVEGACIÓN Y TEMA (GLOBAL)
    // ==========================================================================

    // --------------------------------------------------------------------------
    // 1.1. Lógica del Tema (Claro / Oscuro)
    // --------------------------------------------------------------------------
    
    /**
     * Obtiene el tema guardado en localStorage.
     * Si es la primera visita (null), retorna 'dark' por defecto.
     */
    function getPreferredTheme() {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme : 'dark';
    }

    /**
     * Aplica la clase 'dark' al HTML, persiste la preferencia
     * y actualiza el icono del botón #theme-toggle.
     */
    function applyTheme(theme) {
        const isDark = theme === 'dark';
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('theme', theme);

        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            const themeIcon = themeToggleBtn.querySelector('.material-symbols-outlined');
            if (themeIcon) {
                // Si es dark muestra el sol para cambiar a claro, y viceversa
                themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
            }
        }
    }

    // Inicialización inmediata del tema al cargar el script
    applyTheme(getPreferredTheme());

    // Event Listener para el botón de alternar tema
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentIsDark = document.documentElement.classList.contains('dark');
            const newTheme = currentIsDark ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // --------------------------------------------------------------------------
    // 1.3. Sombra dinámica del header + botón flotante "Volver arriba" (global)
    // Ambos elementos son opcionales: si una página no tiene #site-header o
    // #back-to-top, este bloque simplemente no hace nada en ella.
    // --------------------------------------------------------------------------

    const siteHeader = document.getElementById('site-header');
    const backToTopBtn = document.getElementById('back-to-top');

    function actualizarEstadoScroll() {
        const haHechoScroll = window.scrollY > 10;

        if (siteHeader) {
            siteHeader.classList.toggle('shadow-lg', haHechoScroll);
            siteHeader.classList.toggle('shadow-slate-900/5', haHechoScroll);
            siteHeader.classList.toggle('dark:shadow-black/40', haHechoScroll);
        }

        if (backToTopBtn) {
            backToTopBtn.classList.toggle('hidden', window.scrollY < 400);
        }
    }

    actualizarEstadoScroll();
    window.addEventListener('scroll', actualizarEstadoScroll, { passive: true });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --------------------------------------------------------------------------
    // 1.4. Menú Hamburguesa (Móvil)
    // --------------------------------------------------------------------------

    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
            hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }


    // ==========================================================================
    // MÓDULO 2: CRONOGRAMA Y CALENDARIO (cronograma.html)
    // ==========================================================================

    const calendarGrid = document.getElementById('calendar-grid');
    const calendarRangeTitle = document.getElementById('calendar-range-title');
    const prevWeekBtn = document.getElementById('prev-week-btn');
    const nextWeekBtn = document.getElementById('next-week-btn');
    const todayBtn = document.getElementById('today-btn');
    const upcomingEventsContainer = document.getElementById('upcoming-events-grid');

    if (calendarGrid) {
        let eventsData = [];
        let currentStartDate = new Date();

        fetch('archivos_json/eventos.json')
            .then(res => {
                if (!res.ok) throw new Error('No se encontró en archivos_json');
                return res.json();
            })
            .then(data => initCronograma(data))
            .catch(() => {
                fetch('eventos.json')
                    .then(res => res.json())
                    .then(data => initCronograma(data))
                    .catch(err => console.error('Error al cargar eventos.json:', err));
            });

        function initCronograma(data) {
            eventsData = data;
            renderCalendar(currentStartDate, eventsData);
            renderUpcomingEvents(eventsData);
        }

        if (prevWeekBtn) {
            prevWeekBtn.addEventListener('click', () => {
                currentStartDate.setDate(currentStartDate.getDate() - 7);
                renderCalendar(currentStartDate, eventsData);
            });
        }

        if (nextWeekBtn) {
            nextWeekBtn.addEventListener('click', () => {
                currentStartDate.setDate(currentStartDate.getDate() + 7);
                renderCalendar(currentStartDate, eventsData);
            });
        }

        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                currentStartDate = new Date();
                renderCalendar(currentStartDate, eventsData);
            });
        }

        function renderCalendar(startDate, events) {
            calendarGrid.innerHTML = '';
            const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

            dayNames.forEach(name => {
                const headerCell = document.createElement('div');
                headerCell.className = 'text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-2 text-center';
                headerCell.textContent = name;
                calendarGrid.appendChild(headerCell);
            });

            const daysCount = 21;
            const tempDate = new Date(startDate);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + daysCount - 1);

            if (calendarRangeTitle) {
                const options = { month: 'short', day: 'numeric' };
                calendarRangeTitle.innerHTML = `<span class="material-symbols-outlined text-sky-500">calendar_month</span> ${tempDate.toLocaleDateString('es-ES', options)} - ${endDate.toLocaleDateString('es-ES', options)}`;
            }

            const formatDateLocal = (d) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const todayStr = formatDateLocal(new Date());

            for (let i = 0; i < daysCount; i++) {
                const dateStr = formatDateLocal(tempDate);
                const dayNumber = tempDate.getDate();

                const dayEvents = events.filter(e => {
                    const fInicio = e.fechaInicio || e.fecha;
                    const fFin = e.fechaFin || fInicio;
                    return dateStr >= fInicio && dateStr <= fFin;
                });

                const isToday = dateStr === todayStr;

                const dayCard = document.createElement('div');
                dayCard.className = `relative flex flex-col items-center justify-between p-3 rounded-2xl border transition-all duration-200 min-h-[80px] cursor-pointer ${isToday
                    ? 'border-sky-500 bg-sky-500/10 text-sky-500 font-bold'
                    : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0b1319]/50 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`;

                let dotsHTML = '';
                if (dayEvents.length > 0) {
                    dotsHTML = `
                    <div class="flex gap-1 mt-2 z-10 pointer-events-none">
                        ${dayEvents.map(evt => `
                            <span class="w-2.5 h-2.5 rounded-full shadow-sm" style="background-color: ${evt.colorAccent || '#38bdf8'}"></span>
                        `).join('')}
                    </div>
                `;
                }

                let popoverHTML = '';
                if (dayEvents.length > 0) {
                    popoverHTML = `
                    <div class="calendar-popover absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden flex-col gap-2 w-64 p-3 bg-slate-900/95 dark:bg-[#121e28]/95 border border-slate-700 dark:border-white/10 backdrop-blur-md rounded-xl shadow-2xl text-left z-30 transition-all">
                        ${dayEvents.map(evt => {
                        const horaTexto = (evt.horaInicio && evt.horaFin)
                            ? `${evt.horaInicio} - ${evt.horaFin}`
                            : (evt.horario || evt.horaInicio || '18:00');
                        return `
                                <a href="actividades.html#${evt.id || ''}" class="block p-2 rounded-lg hover:bg-white/10 transition-colors group">
                                    <div class="text-slate-400 font-medium flex items-center justify-between text-[11px]">
                                        <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs text-sky-400">schedule</span> ${horaTexto}</span>
                                        <span class="text-[10px] opacity-75 font-semibold">${evt.estado || ''}</span>
                                    </div>
                                    <div class="font-bold text-white text-xs group-hover:text-sky-400 transition-colors mt-0.5">${evt.titulo}</div>
                                </a>
                            `;
                    }).join('<hr class="border-white/10 my-1">')}
                    </div>
                `;
                }

                dayCard.innerHTML = `
                <span class="text-[10px] text-slate-400 font-medium pointer-events-none">${dayNames[i % 7]}</span>
                <span class="text-base pointer-events-none ${isToday ? 'text-sky-500' : 'text-slate-800 dark:text-slate-200'}">${dayNumber}</span>
                ${dotsHTML}
                ${popoverHTML}
            `;

                if (dayEvents.length > 0) {
                    let hoverTimer = null;

                    const openPopover = () => {
                        document.querySelectorAll('.calendar-popover').forEach(p => {
                            p.classList.add('hidden');
                            p.classList.remove('flex');
                            // Se reinicia el ajuste de posición de cualquier popover previamente movido
                            p.style.transform = '';
                        });

                        const popover = dayCard.querySelector('.calendar-popover');
                        if (popover) {
                            popover.classList.remove('hidden');
                            popover.classList.add('flex');

                            // --------------------------------------------------------------
                            // Ajuste dinámico de posición (anti-corte en bordes del viewport)
                            // No se modifican las clases de Tailwind (siguen centrando el
                            // popover por defecto); solo se corrige con un transform inline
                            // cuando el popover se saldría de la pantalla por izquierda/derecha.
                            // --------------------------------------------------------------
                            requestAnimationFrame(() => {
                                const rect = popover.getBoundingClientRect();
                                const margen = 12; // separación mínima respecto al borde de la pantalla

                                const desbordeIzquierda = margen - rect.left;
                                const desbordeDerecha = rect.right - (window.innerWidth - margen);

                                if (desbordeIzquierda > 0) {
                                    popover.style.transform = `translateX(calc(-50% + ${desbordeIzquierda}px))`;
                                } else if (desbordeDerecha > 0) {
                                    popover.style.transform = `translateX(calc(-50% - ${desbordeDerecha}px))`;
                                }
                            });
                        }
                    };

                    dayCard.addEventListener('mouseenter', () => {
                        hoverTimer = setTimeout(openPopover, 2000);
                    });

                    dayCard.addEventListener('mouseleave', () => {
                        if (hoverTimer) {
                            clearTimeout(hoverTimer);
                            hoverTimer = null;
                        }
                    });

                    dayCard.addEventListener('click', (e) => {
                        if (e.target.closest('a')) return;
                        if (hoverTimer) clearTimeout(hoverTimer);
                        e.stopPropagation();
                        openPopover();
                    });
                }

                calendarGrid.appendChild(dayCard);
                tempDate.setDate(tempDate.getDate() + 1);
            }
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#calendar-grid')) {
                document.querySelectorAll('.calendar-popover').forEach(p => {
                    p.classList.add('hidden');
                    p.classList.remove('flex');
                });
            }
        });

        // ======================================================================
// FUNCIÓN: renderUpcomingEvents (cronograma.html)
// ======================================================================
function renderUpcomingEvents(events) {
    if (!upcomingEventsContainer) return;
    upcomingEventsContainer.innerHTML = '';

    const safeEvents = Array.isArray(events) ? events : [];
    if (safeEvents.length === 0) {
        upcomingEventsContainer.innerHTML = `
        <div class="col-span-full text-center py-6 text-slate-400 text-xs">
            No hay próximas actividades programadas.
        </div>
    `;
        return;
    }

    const formatDateLocal = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    const todayStr = formatDateLocal(new Date());

    const enCurso = safeEvents.filter(e => {
        const fInicio = e.fechaInicio || e.fecha;
        const fFin = e.fechaFin || fInicio;
        return fInicio && fFin && todayStr >= fInicio && todayStr <= fFin;
    });

    const futuras = safeEvents
        .filter(e => {
            const fInicio = e.fechaInicio || e.fecha;
            return fInicio && fInicio > todayStr;
        })
        .sort((a, b) => (a.fechaInicio || a.fecha).localeCompare(b.fechaInicio || b.fecha));

    const upcoming = [...enCurso, ...futuras].slice(0, 2);

    if (upcoming.length === 0) {
        upcomingEventsContainer.innerHTML = `
        <div class="col-span-full text-center py-6 text-slate-400 text-xs">
            No hay próximas actividades programadas.
        </div>
    `;
        return;
    }

    upcoming.forEach(evt => {
        const fInicio = evt.fechaInicio || evt.fecha || 'Próximamente';
        const horaTexto = (evt.horaInicio && evt.horaFin)
            ? `${evt.horaInicio} - ${evt.horaFin}`
            : (evt.horario || evt.horaInicio || 'Por definir');

        const statusBadge = getStatusBadge(evt.estado);

        const card = document.createElement('div');
        card.className = 'bg-slate-100 dark:bg-[#121e28] border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300';
        
        card.innerHTML = `
        <div class="space-y-3">
            <div class="flex items-center justify-between text-xs text-slate-400">
                <span class="flex items-center gap-1 font-medium text-sky-400">
                    <span class="material-symbols-outlined text-sm">calendar_today</span>
                    ${fInicio}
                </span>
                <div class="flex items-center gap-1.5">
                    ${statusBadge}
                    <span class="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-semibold">
                        ${evt.categoria || 'General'}
                    </span>
                </div>
            </div>
            <h4 class="font-bold text-slate-900 dark:text-white text-base leading-snug break-words">${evt.titulo || 'Sin título'}</h4>
            
            <div class="space-y-1">
                <!-- Se agregó break-words para forzar el salto de línea en texto continuo -->
                <p class="card-desc text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed transition-all duration-300 break-words">${evt.descripcion || ''}</p>
                ${(evt.descripcion && evt.descripcion.length > 80) ? `
                    <button type="button" class="toggle-expand-btn text-[11px] text-sky-400 hover:underline font-semibold focus:outline-none flex items-center gap-0.5 mt-1">
                        <span class="btn-text">Ver más</span>
                        <span class="material-symbols-outlined text-xs btn-icon">expand_more</span>
                    </button>
                ` : ''}
            </div>
        </div>
        
        <div class="pt-4 mt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-sm text-sky-400">schedule</span>
                ${horaTexto}
            </span>
            <a href="actividades.html#${evt.id || ''}" class="text-sky-400 hover:underline font-semibold flex items-center gap-1">
                Ver detalles <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
        </div>
    `;

        const toggleBtn = card.querySelector('.toggle-expand-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const desc = card.querySelector('.card-desc');
                const btnText = toggleBtn.querySelector('.btn-text');
                const btnIcon = toggleBtn.querySelector('.btn-icon');

                const isExpanded = desc.classList.contains('line-clamp-none');
                if (isExpanded) {
                    desc.classList.remove('line-clamp-none');
                    desc.classList.add('line-clamp-2');
                    btnText.textContent = 'Ver más';
                    btnIcon.textContent = 'expand_more';
                } else {
                    desc.classList.remove('line-clamp-2');
                    desc.classList.add('line-clamp-none');
                    btnText.textContent = 'Ver menos';
                    btnIcon.textContent = 'expand_less';
                }
            });
        }

        upcomingEventsContainer.appendChild(card);
    });
}
    }
    // ==========================================================================
    // MÓDULO 3: ACTIVIDADES Y GALERÍA (actividades.html)
    // ==========================================================================

    const actividadesGrid = document.getElementById('actividades-grid');
    const galeriaGrid = document.getElementById('galeria-grid');
    const galeriaDestacadaContainer = document.getElementById('galeria-destacada');
    const galeriaSecundariaContainer = document.getElementById('galeria-secundaria');
    const filterContainer = document.getElementById('status-filter-container') || document.getElementById('filter-tabs');

    // Función auxiliar para badges de estado si no está definida globalmente
    const safeGetStatusBadge = (estado) => {
        if (typeof getStatusBadge === 'function') return getStatusBadge(estado);
        const est = (estado || '').toLowerCase().replace('_', ' ');
        let badgeClass = 'bg-sky-500/10 text-sky-500 border-sky-500/20';
        if (est.includes('curso')) badgeClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        else if (est.includes('proxima') || est.includes('empezar')) badgeClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        else if (est.includes('finalizada') || est.includes('terminada')) badgeClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';

        return `<span class="border text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeClass}">${estado || 'General'}</span>`;
    };

    if (actividadesGrid) {
        let todasLasActividades = [];

        // 1. Carga de Eventos y Actividades desde eventos.json
        fetch('archivos_json/eventos.json')
            .then(res => {
                if (!res.ok) throw new Error('No encontrado en archivos_json');
                return res.json();
            })
            .then(data => initActividadesYGaleria(data))
            .catch(() => {
                fetch('eventos.json')
                    .then(res => res.json())
                    .then(data => initActividadesYGaleria(data))
                    .catch(err => {
                        console.error('Error al cargar eventos.json:', err);
                        actividadesGrid.innerHTML = `
                            <div class="col-span-full text-center py-8 text-slate-400 text-sm">
                                No se pudieron cargar las actividades en este momento.
                            </div>
                        `;
                    });
            });

        // 2. Inicialización del módulo y listeners de filtrado
        function initActividadesYGaleria(data) {
            todasLasActividades = Array.isArray(data) ? data : (data.actividades || []);
            const fotosGaleria = Array.isArray(data) ? [] : (data.galeria || []);

            renderActividades(todasLasActividades);

            if (fotosGaleria.length > 0) {
                renderGaleria(fotosGaleria);
            } else {
                cargarGaleriaIndependiente();
            }

            // Event Listeners para Filtros por Estado (soporta .status-btn y .tab-btn)
            if (filterContainer) {
                const filterButtons = filterContainer.querySelectorAll('.status-btn, .tab-btn');

                filterButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        filterButtons.forEach(b => {
                            b.classList.remove('bg-sky-500', 'text-white', 'active');
                            b.classList.add('text-slate-600', 'dark:text-slate-300');
                        });

                        btn.classList.add('bg-sky-500', 'text-white', 'active');
                        btn.classList.remove('text-slate-600', 'dark:text-slate-300');

                        const statusFilter = btn.dataset.status || btn.dataset.filter;

                        if (!statusFilter || statusFilter === 'all' || statusFilter === 'todos') {
                            renderActividades(todasLasActividades);
                        } else {
                            const filtradas = todasLasActividades.filter(act => {
                                const estadoL = (act.estado || '').toLowerCase().replace('_', ' ');
                                if (statusFilter === 'en_curso') return estadoL.includes('curso');
                                if (statusFilter === 'por_empezar') return estadoL.includes('proxima') || estadoL.includes('empezar');
                                if (statusFilter === 'terminadas') return estadoL.includes('finalizada') || estadoL.includes('terminada');
                                return estadoL.includes(statusFilter.toLowerCase());
                            });
                            renderActividades(filtradas);
                        }
                    });
                });
            }
        }

        // 3. Renderizado Dinámico de Tarjetas de Actividades
     // ==========================================================================
// RENDERIZADO DINÁMICO DE TARJETAS DE ACTIVIDADES (script.js)
// ==========================================================================
function renderActividades(lista) {
    if (!actividadesGrid) return;
    actividadesGrid.innerHTML = '';

    if (!lista || lista.length === 0) {
        actividadesGrid.innerHTML = `
            <div class="col-span-full text-center py-12 text-slate-400 text-sm">
                No hay actividades registradas en este estado.
            </div>
        `;
        return;
    }

    lista.forEach(act => {
        const card = document.createElement('article');
        card.id = act.id || '';
        card.className = 'bg-slate-100 dark:bg-[#121e28] border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300';

        const fInicio = act.fechaInicio || act.fecha || 'Por definir';
        const horaTexto = (act.horaInicio && act.horaFin)
            ? `${act.horaInicio} - ${act.horaFin}`
            : (act.horario || act.horaInicio || 'Por definir');

        const statusBadge = safeGetStatusBadge(act.estado);

        // ------------------------------------------------------------------
        // LÓGICA CONDICIONAL DE ENLACES (CASO A vs CASO B)
        // ------------------------------------------------------------------
        const enlaceValido = (act.link && act.link.trim() !== '') 
            ? act.link.trim() 
            : ((act.link_reunion && act.link_reunion.trim() !== '') ? act.link_reunion.trim() : null);

        // ------------------------------------------------------------------
        // LÓGICA CONDICIONAL DE ESTADO (regla de negocio)
        // Se reutiliza la misma normalización que ya usa getStatusBadge/safeGetStatusBadge
        // para no introducir un criterio de comparación distinto al resto del código.
        // ------------------------------------------------------------------
        const estadoNormalizado = (act.estado || '').toLowerCase().replace('_', ' ');
        const esEstadoTerminado = estadoNormalizado.includes('terminad') || estadoNormalizado.includes('finalizada');
        const esEstadoEnCurso = estadoNormalizado.includes('curso');

        let botonHTML = '';

        if (enlaceValido) {
            // CASO A: Existe enlace válido -> Abrir en nueva pestaña
            // Regla 1: si el estado es "terminado" (o equivalente), el botón de enlace se oculta por completo.
            if (!esEstadoTerminado) {
                botonHTML = `
                    <a href="${enlaceValido}" target="_blank" rel="noopener noreferrer" 
                       class="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
                        <span>Unirse al evento</span>
                        <span class="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                `;
            }
        } else {
            // CASO B: NO existe enlace -> Redirigir a la página de inscripción con el ID del evento
            // Regla 2: si el estado es "en curso" o "terminado" (equivalente), el botón "Inscribirse" no se renderiza.
            if (!esEstadoEnCurso && !esEstadoTerminado) {
                const eventoParam = act.id ? encodeURIComponent(act.id) : encodeURIComponent(act.titulo || '');
                botonHTML = `
                    <a href="inscripciones-actividades.html?evento=${eventoParam}" 
                       class="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
                        <span>Inscribirse</span>
                        <span class="material-symbols-outlined text-sm">how_to_reg</span>
                    </a>
                `;
            }
        }

        card.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-1.5">
                        <span class="bg-sky-500/10 text-sky-500 border border-sky-500/20 text-xs font-semibold px-3 py-1 rounded-full">
                            ${act.categoria || 'General'}
                        </span>
                        ${statusBadge}
                    </div>
                    <span class="text-xs text-slate-400 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm text-sky-400">location_on</span>
                        ${act.ubicacion || act.lugar || 'Por definir'}
                    </span>
                </div>

                <h3 class="text-xl font-bold text-slate-900 dark:text-white leading-snug break-words">${act.titulo}</h3>
                
                ${act.speaker ? `
                    <p class="text-xs font-semibold text-sky-500 dark:text-sky-400 flex items-center gap-1 break-words">
                        <span class="material-symbols-outlined text-sm">record_voice_over</span>
                        ${act.speaker}
                    </p>
                ` : ''}

                <div class="space-y-1">
                    <p class="card-desc text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-3 transition-all duration-300 break-words">${act.descripcion || ''}</p>
                    ${(act.descripcion && act.descripcion.length > 100) ? `
                        <button type="button" class="toggle-expand-btn text-[11px] text-sky-400 hover:underline font-semibold focus:outline-none flex items-center gap-0.5 mt-1">
                            <span class="btn-text">Ver más</span>
                            <span class="material-symbols-outlined text-xs btn-icon">expand_more</span>
                        </button>
                    ` : ''}
                </div>
            </div>

            <div class="pt-6 mt-6 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div class="flex flex-col gap-1">
                    <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm text-sky-400">calendar_today</span>
                        ${fInicio}
                    </span>
                    <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm text-sky-400">schedule</span>
                        ${horaTexto}
                    </span>
                </div>
                ${botonHTML}
            </div>
        `;

        // Expandir / contraer descripción
        const toggleBtn = card.querySelector('.toggle-expand-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const desc = card.querySelector('.card-desc');
                const btnText = toggleBtn.querySelector('.btn-text');
                const btnIcon = toggleBtn.querySelector('.btn-icon');

                const isExpanded = desc.classList.contains('line-clamp-none');
                if (isExpanded) {
                    desc.classList.remove('line-clamp-none');
                    desc.classList.add('line-clamp-3');
                    btnText.textContent = 'Ver más';
                    btnIcon.textContent = 'expand_more';
                } else {
                    desc.classList.remove('line-clamp-3');
                    desc.classList.add('line-clamp-none');
                    btnText.textContent = 'Ver menos';
                    btnIcon.textContent = 'expand_less';
                }
            });
        }

        actividadesGrid.appendChild(card);
    });
}
        // 4. Renderizado Dinámico de Galería (Soporta estructura simple y contenedores asimétricos)
        function renderGaleria(listaFotos) {
            if (!listaFotos || listaFotos.length === 0) return;

            // Opción A: Galería estándar en grid simple
            if (galeriaGrid) {
                galeriaGrid.innerHTML = '';
                listaFotos.forEach(item => {
                    const card = document.createElement('figure');
                    card.className = 'group relative bg-slate-100 dark:bg-[#121e28] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer';

                    const imgSrc = item.imagen || item.url || '';
                    const titleText = (item.titulo || '').replace(/"/g, '&quot;');
                    const descText = (item.descripcion || item.evento || '').replace(/"/g, '&quot;');

                    card.onclick = () => abrirModal(imgSrc, titleText, descText);

                    card.innerHTML = `
                        <div class="relative h-48 w-full overflow-hidden bg-slate-900">
                            <img 
                                src="${imgSrc}" 
                                alt="${titleText}" 
                                class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                onerror="this.src='assets/pacha/Mesa de trabajo 21 copia 2-8.png'; this.classList.add('p-4', 'object-contain');"
                            />
                        </div>
                        <figcaption class="p-5 flex-grow flex flex-col justify-between space-y-2">
                            <h3 class="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-sky-400 transition-colors">
                                ${item.titulo || ''}
                            </h3>
                            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                ${item.descripcion || item.evento || ''}
                            </p>
                        </figcaption>
                    `;
                    galeriaGrid.appendChild(card);
                });
            }

            // Opción B: Layout Asimétrico Destacado/Secundarias
            if (galeriaDestacadaContainer && galeriaSecundariaContainer) {
                galeriaDestacadaContainer.innerHTML = '';
                galeriaSecundariaContainer.innerHTML = '';

                const destacada = listaFotos.find(f => f.destacada) || listaFotos[0];
                const secundarias = listaFotos.filter(f => f !== destacada);

                const destImg = destacada.imagen || '';
                const destTitle = (destacada.titulo || '').replace(/"/g, '&quot;');
                const destDesc = (destacada.evento || destacada.descripcion || '').replace(/"/g, '&quot;');

                galeriaDestacadaContainer.innerHTML = `
                    <div onclick="abrirModal('${destImg}', '${destTitle}', '${destDesc}')" class="relative group overflow-hidden rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-[#121e28] h-full min-h-[280px] flex flex-col justify-end p-6 cursor-pointer">
                        <img src="${destImg}" alt="${destTitle}" class="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" onerror="this.src='assets/pacha/Mesa de trabajo 21 copia 2-8.png'; this.classList.add('p-8', 'object-contain');" />
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
                        <div class="relative z-10 space-y-1">
                            <span class="text-xs text-sky-400 font-semibold flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">photo_camera</span>
                                ${destacada.cantidadFotos || 1} Fotos
                            </span>
                            <h3 class="text-xl font-bold text-white">${destacada.titulo || ''}</h3>
                            <p class="text-xs text-slate-300">${destacada.evento || destacada.descripcion || ''}</p>
                        </div>
                    </div>
                `;

                secundarias.forEach(foto => {
                    const secImg = foto.imagen || '';
                    const secTitle = (foto.titulo || '').replace(/"/g, '&quot;');
                    const secDesc = (foto.evento || foto.descripcion || '').replace(/"/g, '&quot;');

                    const item = document.createElement('div');
                    item.className = 'relative group overflow-hidden rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-[#121e28] h-48 flex flex-col justify-end p-5 cursor-pointer';
                    item.onclick = () => abrirModal(secImg, secTitle, secDesc);

                    item.innerHTML = `
                        <img src="${secImg}" alt="${secTitle}" class="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" onerror="this.src='assets/pacha/Mesa de trabajo 21 copia 2-8.png'; this.classList.add('p-6', 'object-contain');" />
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent"></div>
                        <div class="relative z-10 space-y-0.5">
                            <span class="text-[10px] text-sky-400 font-semibold flex items-center gap-1">
                                <span class="material-symbols-outlined text-xs">photo_camera</span>
                                ${foto.cantidadFotos || 1} Fotos
                            </span>
                            <h4 class="text-base font-bold text-white leading-tight">${foto.titulo || ''}</h4>
                            <p class="text-[11px] text-slate-300">${foto.evento || foto.descripcion || ''}</p>
                        </div>
                    `;
                    galeriaSecundariaContainer.appendChild(item);
                });
            }
        }

        // 5. Carga de respaldo para galeria.json independiente
        function cargarGaleriaIndependiente() {
            fetch('archivos_json/galeria.json')
                .then(res => {
                    if (!res.ok) throw new Error();
                    return res.json();
                })
                .then(data => renderGaleria(data))
                .catch(() => {
                    fetch('galeria.json')
                        .then(res => res.json())
                        .then(data => renderGaleria(data))
                        .catch(err => console.error('Error al cargar galeria.json:', err));
                });
        }
    }
    // ==========================================================================
    // MÓDULO LIGHTBOX / VISOR DE IMÁGENES
    // ==========================================================================
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalClose = document.getElementById('modal-close');

    window.abrirModal = function (src, titulo, descripcion) {
        if (!modal || !modalImg) return;
        modalImg.src = src;
        modalTitle.textContent = titulo || '';
        modalDesc.textContent = descripcion || '';

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden'; // Bloquea el scroll de la página de fondo
    };

    function cerrarModal() {
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto'; // Restaura el scroll
    }

    if (modalClose) {
        modalClose.addEventListener('click', cerrarModal);
    }

    // Cerrar al hacer clic fuera del contenido o presionar la tecla ESC
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') cerrarModal();
        });
    }

    // ==========================================================================
    // MÓDULO 4: INTEGRANTES (integrantes.html)
    // ==========================================================================

    const integrantesGrid = document.getElementById('integrantes-grid');

    if (integrantesGrid) {
        fetch('archivos_json/integrantes.json')
            .then(res => {
                if (!res.ok) throw new Error('No se encontró en archivos_json');
                return res.json();
            })
            .then(data => renderIntegrantes(data))
            .catch(() => {
                fetch('integrantes.json')
                    .then(res => res.json())
                    .then(data => renderIntegrantes(data))
                    .catch(err => {
                        console.error('Error al cargar integrantes.json:', err);
                        integrantesGrid.innerHTML = `
                            <div class="col-span-full text-center py-8 text-slate-400 text-sm">
                                No se pudieron cargar los integrantes en este momento.
                            </div>
                        `;
                    });
            });

        function renderIntegrantes(integrantes) {
            integrantesGrid.innerHTML = '';

            if (!integrantes || integrantes.length === 0) {
                integrantesGrid.innerHTML = `
                    <div class="col-span-full text-center py-8 text-slate-400 text-sm">
                        No hay integrantes registrados en este momento.
                    </div>
                `;
                return;
            }

            integrantes.forEach(miembro => {
                const card = document.createElement('article');
                card.id = miembro.id;
                card.className = 'relative bg-slate-100 dark:bg-[#121e28] border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 min-h-[320px]';

                const badgesHTML = (miembro.habilidades || []).map(hab => `
                    <span class="bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        ${hab}
                    </span>
                `).join('');

                const redes = miembro.redes || {};
                const githubHTML = redes.github ? `<a href="${redes.github}" target="_blank" rel="noopener noreferrer" class="text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors" aria-label="GitHub"><i class="fa-brands fa-github text-lg"></i></a>` : '';
                const linkedinHTML = redes.linkedin ? `<a href="${redes.linkedin}" target="_blank" rel="noopener noreferrer" class="text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors" aria-label="LinkedIn"><i class="fa-brands fa-linkedin text-lg"></i></a>` : '';
                const instagramHTML = redes.instagram ? `<a href="${redes.instagram}" target="_blank" rel="noopener noreferrer" class="text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors" aria-label="Instagram"><i class="fa-brands fa-instagram text-lg"></i></a>` : '';

                card.innerHTML = `
                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <img src="${miembro.foto}" alt="${miembro.nombre}" class="w-16 h-16 rounded-full object-cover border-2 border-sky-500/30 flex-shrink-0" onerror="this.src='assets/pacha/Mesa de trabajo 21 copia 2-8.png'"/>
                            <div>
                                <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-snug">${miembro.nombre}</h3>
                                <p class="text-xs font-medium text-sky-500 dark:text-sky-400">${miembro.rol}</p>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-1.5 pt-1">
                            ${badgesHTML}
                        </div>

                        <p class="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                            ${miembro.descripcion}
                        </p>
                    </div>

                    <div class="flex items-center justify-between pt-6 mt-4 border-t border-slate-200 dark:border-white/5">
                        <div class="flex items-center gap-3">
                            ${githubHTML}
                            ${linkedinHTML}
                            ${instagramHTML}
                        </div>
                        <span class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl" title="Área de desempeño">
                            ${miembro.iconoArea || 'code'}
                        </span>
                    </div>
                `;

                integrantesGrid.appendChild(card);
            });
        }
    }
    // ==========================================================================
    // HELPER GLOBAL: Carga de JSON sin caché, con fallback de ruta
    // (Usado por Módulo 5 - Próximos Eventos y Módulo 6 - Carrusel Momentos SID)
    // ==========================================================================

    function cargarJSON(nombreArchivo) {
        const opciones = { cache: 'no-store' };
        return fetch(`archivos_json/${nombreArchivo}`, opciones)
            .then(res => {
                if (!res.ok) throw new Error('No encontrado en archivos_json');
                return res.json();
            })
            .catch(() => fetch(nombreArchivo, opciones).then(res => res.json()));
    }


    // ==========================================================================
    // MÓDULO 6: CARRUSEL "MOMENTOS SID" (index.html)
    // ==========================================================================

    const momentosCarousel = document.getElementById('momentos-carousel');
    const momentosTrack = document.getElementById('momentos-carousel-track');

    if (momentosCarousel && momentosTrack) {
        const dotsContainer = document.getElementById('momentos-carousel-dots');
        const prevBtn = document.getElementById('momentos-prev-btn');
        const nextBtn = document.getElementById('momentos-next-btn');

        let slides = [];
        let currentIndex = 0;
        let autoplayTimer = null;
      // ==========================================================================
// MÓDULO 5: CARRUSEL "PRÓXIMOS EVENTOS" (index.html)
// ==========================================================================

const proximoEventoCard = document.getElementById('proximo-evento-card');

if (proximoEventoCard) {
    const trackEl = document.getElementById('proximo-evento-track');
    const dotsEl = document.getElementById('proximo-evento-dots');
    const prevBtn = document.getElementById('proximo-evento-prev');
    const nextBtn = document.getElementById('proximo-evento-next');

    let eventosSlides = [];
    let eventoIndex = 0;
    let eventoAutoplay = null;

    cargarJSON('eventos.json')
        .then(data => initProximosEventosCarousel(data))
        .catch(err => {
            console.error('Error al cargar eventos.json (carrusel próximos eventos):', err);
            if (trackEl) {
                trackEl.innerHTML = `<p class="text-xs text-slate-500 dark:text-slate-400 shrink-0 w-full">No se pudieron cargar los eventos.</p>`;
            }
            if (prevBtn) prevBtn.classList.add('hidden');
            if (nextBtn) nextBtn.classList.add('hidden');
        });

    function initProximosEventosCarousel(eventos) {
        if (!Array.isArray(eventos)) eventos = [];

        const formatDateLocal = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };
        const todayStr = formatDateLocal(new Date());

        // 1) Eventos "En curso" primero
        const enCurso = eventos.filter(e => (e.estado || '').toLowerCase() === 'en curso');

        // 2) Eventos futuros, ordenados por fecha más cercana
        const futuros = eventos
            .filter(e => (e.estado || '').toLowerCase() !== 'en curso' && e.fechaInicio && e.fechaInicio >= todayStr)
            .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));

        // Máximo 5 eventos en el carrusel (en curso + próximos)
        eventosSlides = [...enCurso, ...futuros].slice(0, 5).map(evento => ({
            titulo: evento.titulo || '',
            badge: calcularBadge(evento, todayStr),
            detalle: construirDetalle(evento)
        }));

        if (!eventosSlides.length) {
            trackEl.innerHTML = `<p class="text-xs text-slate-500 dark:text-slate-400 shrink-0 w-full">No hay eventos próximos por ahora.</p>`;
            if (prevBtn) prevBtn.classList.add('hidden');
            if (nextBtn) nextBtn.classList.add('hidden');
            return;
        }

        renderEventoSlides();
        renderEventoDots();
        goToEventoSlide(0);

        if (eventosSlides.length > 1) {
            startEventoAutoplay();
            proximoEventoCard.addEventListener('mouseenter', stopEventoAutoplay);
            proximoEventoCard.addEventListener('mouseleave', startEventoAutoplay);
        } else {
            if (prevBtn) prevBtn.classList.add('hidden');
            if (nextBtn) nextBtn.classList.add('hidden');
        }
    }

    function calcularBadge(evento, todayStr) {
        const estado = (evento.estado || '').toLowerCase();
        if (estado === 'en curso') return 'En curso';
        if (evento.fechaInicio) {
            const diffDias = Math.round(
                (new Date(evento.fechaInicio) - new Date(todayStr)) / (1000 * 60 * 60 * 24)
            );
            if (diffDias === 0) return 'Hoy';
            if (diffDias === 1) return 'Mañana';
            if (diffDias > 1) return `En ${diffDias} días`;
            return evento.fechaInicio;
        }
        return 'Próximamente';
    }

    // Se omitió evento.descripcion para dejar únicamente lugar y hora
    function construirDetalle(evento) {
        const partes = [];
        if (evento.lugar) partes.push(`📍 ${evento.lugar}`);
        if (evento.horaInicio) partes.push(`🕒 ${evento.horaInicio}${evento.horaFin ? ' - ' + evento.horaFin : ''}`);
        return partes.join(' — ');
    }

    function renderEventoSlides() {
        trackEl.style.width = `${eventosSlides.length * 100}%`;
        trackEl.innerHTML = eventosSlides.map(slide => `
            <div style="width:${100 / eventosSlides.length}%" class="shrink-0 space-y-1.5 pr-1 min-w-0">
                <div class="flex justify-between items-center gap-2">
                    <h4 class="text-sm font-bold text-slate-800 dark:text-white truncate min-w-0" title="${slide.titulo}">${slide.titulo}</h4>
                    <span class="shrink-0 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-medium">${slide.badge}</span>
                </div>
                ${slide.detalle ? `<p class="text-xs text-slate-600 dark:text-slate-400 leading-normal truncate min-w-0">${slide.detalle}</p>` : ''}
            </div>
        `).join('');
    }

    function renderEventoDots() {
        if (!dotsEl) return;
        if (eventosSlides.length <= 1) {
            dotsEl.innerHTML = '';
            return;
        }
        dotsEl.innerHTML = eventosSlides.map((_, i) => `
            <button data-index="${i}" class="evento-dot w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors" aria-label="Ir al evento ${i + 1}"></button>
        `).join('');

        dotsEl.querySelectorAll('.evento-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                goToEventoSlide(parseInt(dot.dataset.index, 10));
                restartEventoAutoplay();
            });
        });
    }

    function goToEventoSlide(index) {
        eventoIndex = (index + eventosSlides.length) % eventosSlides.length;
        const offset = eventoIndex * (100 / eventosSlides.length);
        trackEl.style.transform = `translateX(-${offset}%)`;

        if (dotsEl) {
            dotsEl.querySelectorAll('.evento-dot').forEach((dot, i) => {
                dot.classList.toggle('bg-pink-500', i === eventoIndex);
                dot.classList.toggle('bg-slate-300', i !== eventoIndex);
                dot.classList.toggle('dark:bg-slate-700', i !== eventoIndex);
            });
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { goToEventoSlide(eventoIndex - 1); restartEventoAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goToEventoSlide(eventoIndex + 1); restartEventoAutoplay(); });

    // Cambiado de 4500ms a 10000ms (10 segundos)
    function startEventoAutoplay() {
        eventoAutoplay = setInterval(() => goToEventoSlide(eventoIndex + 1), 3000);
    }
    function stopEventoAutoplay() { clearInterval(eventoAutoplay); }
    function restartEventoAutoplay() { stopEventoAutoplay(); startEventoAutoplay(); }
}

Promise.all([
    cargarJSON('eventos.json'),
    cargarJSON('galeria.json')
])
    .then(([eventos, galeria]) => initMomentosCarousel(eventos, galeria))
    .catch(err => console.error('Error al cargar datos del carrusel Momentos SID:', err));

function initMomentosCarousel(eventos, galeria) {
    if (!Array.isArray(eventos)) eventos = [];
    if (!Array.isArray(galeria)) galeria = [];

    slides = relacionarGaleriaConActividades(galeria, eventos).slice(0, 5);

    if (slides.length === 0) {
        momentosCarousel.innerHTML = `
        <div class="p-10 text-center text-slate-400 text-sm">
            Aún no hay imágenes destacadas de actividades.
        </div>
    `;
        if (prevBtn) prevBtn.classList.add('hidden');
        if (nextBtn) nextBtn.classList.add('hidden');
        return;
    }

    renderSlides();
    renderDots();
    goToSlide(0);
    startAutoplay();

    momentosCarousel.addEventListener('mouseenter', stopAutoplay);
    momentosCarousel.addEventListener('mouseleave', startAutoplay);
}
        // --- Emparejamiento galeria <-> eventos ---
        // Ideal: cada objeto de galeria.json trae "actividadId" que coincide con el "id" de eventos.json.
        // Como el JSON actual no lo trae, se hace un match por palabras clave en "evento"/"titulo" vs "titulo" del evento.
        const STOPWORDS = new Set(['de', 'la', 'el', 'los', 'las', 'y', 'a', 'en', 'del', 'con', 'para', 'un', 'una', '2026']);

        function tokenizar(texto) {
            return (texto || '')
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
                .replace(/[^a-z0-9\s]/g, ' ')
                .split(/\s+/)
                .filter(t => t && !STOPWORDS.has(t));
        }

        function relacionarGaleriaConActividades(galeria, eventos) {
            return galeria.map(foto => {
                // Match exacto si algún día agregan actividadId
                if (foto.actividadId) {
                    const directo = eventos.find(e => e.id === foto.actividadId);
                    if (directo) {
                        return { imagen: foto.imagen || foto.url, titulo: foto.titulo || directo.titulo, actividadId: directo.id };
                    }
                }

                // Match por palabras clave compartidas
                const tokensFoto = new Set([...tokenizar(foto.evento), ...tokenizar(foto.titulo)]);
                let mejor = null;
                let mejorPuntaje = 0;

                eventos.forEach(evento => {
                    const tokensEvento = new Set(tokenizar(evento.titulo));
                    let puntaje = 0;
                    tokensFoto.forEach(t => { if (tokensEvento.has(t)) puntaje++; });
                    if (puntaje > mejorPuntaje) {
                        mejorPuntaje = puntaje;
                        mejor = evento;
                    }
                });

                return {
                    imagen: foto.imagen || foto.url,
                    titulo: foto.titulo || (mejor ? mejor.titulo : 'Momento SID'),
                    actividadId: mejor ? mejor.id : null // si no hay match, se redirige sin ancla
                };
            }).filter(s => !!s.imagen);
        }
        function renderSlides() {
            momentosTrack.style.width = `${slides.length * 100}%`;
            momentosTrack.innerHTML = slides.map(slide => {
                const href = slide.actividadId
                    ? `actividades.html#${encodeURIComponent(slide.actividadId)}`
                    : `actividades.html`;
                return `
        <a href="${href}"
           style="width:${100 / slides.length}%"
           class="momento-slide relative flex-shrink-0 h-72 md:h-96 block group overflow-hidden bg-slate-950">
            
            <!-- 1. Imagen de fondo difuminada (Rellena todo el contenedor) -->
            <img src="${slide.imagen}" alt="" aria-hidden="true"
                 class="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-60 pointer-events-none" />

            <!-- 2. Imagen principal sin recortes ni deformación -->
            <img src="${slide.imagen}" alt="${slide.titulo}"
                 class="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                 onerror="this.src='assets/pacha/Mesa de trabajo 21 copia 2-8.png'; this.classList.add('p-10');" />

            <!-- 3. Gradiente para legibilidad del texto -->
            <div class="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>

            <!-- 4. Título de la imagen -->
            <span class="absolute bottom-4 left-5 z-30 text-white font-bold text-lg drop-shadow-md">${slide.titulo}</span>
        </a>
    `;
            }).join('');
        }

        function renderDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = slides.map((_, i) => `
            <button data-index="${i}" class="momento-dot w-2.5 h-2.5 rounded-full bg-white/50 hover:bg-white transition-colors" aria-label="Ir a la imagen ${i + 1}"></button>
        `).join('');

            dotsContainer.querySelectorAll('.momento-dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    goToSlide(parseInt(dot.dataset.index, 10));
                    restartAutoplay();
                });
            });
        }

        function goToSlide(index) {
            currentIndex = (index + slides.length) % slides.length;
            const offset = currentIndex * (100 / slides.length);
            momentosTrack.style.transform = `translateX(-${offset}%)`;

            if (dotsContainer) {
                dotsContainer.querySelectorAll('.momento-dot').forEach((dot, i) => {
                    dot.classList.toggle('bg-white', i === currentIndex);
                    dot.classList.toggle('bg-white/50', i !== currentIndex);
                });
            }
        }

        if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentIndex - 1); restartAutoplay(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentIndex + 1); restartAutoplay(); });

        function startAutoplay() {
            if (slides.length <= 1) return;
            autoplayTimer = setInterval(() => goToSlide(currentIndex + 1), 5000);
        }
        function stopAutoplay() { clearInterval(autoplayTimer); }
        function restartAutoplay() { stopAutoplay(); startAutoplay(); }
    }
    // ==========================================================================
    // HELPER GLOBAL: Badge visual según el estado de una actividad
    // (Usado por el calendario/cronograma y por actividades.html)
    // ==========================================================================
    function getStatusBadge(estado) {
        const est = (estado || '').toLowerCase().replace('_', ' ');
        let badgeClass = 'bg-sky-500/10 text-sky-500 border-sky-500/20';

        if (est.includes('curso')) {
            badgeClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        } else if (est.includes('proxima') || est.includes('próxima') || est.includes('empezar')) {
            badgeClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        } else if (est.includes('finalizada') || est.includes('terminada')) {
            badgeClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }

        return `<span class="border text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeClass}">${estado || 'General'}</span>`;
    }
    

});