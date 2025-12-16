document.addEventListener("DOMContentLoaded", () => {
  // --- Reloj en tiempo real ---
  function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById("clock-time");
    const dateEl = document.getElementById("clock-date");

    if (!timeEl || !dateEl) return;

    const optionsTime = {
      hour: "2-digit",
      minute: "2-digit"
    };

    const optionsDate = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    };

    timeEl.textContent = now.toLocaleTimeString("es-MX", optionsTime);
    dateEl.textContent = now
      .toLocaleDateString("es-MX", optionsDate)
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  updateClock();
  setInterval(updateClock, 1000);

  // --- Manejo de pestañas ---
  const tabButtons = document.querySelectorAll(".tab-btn[data-tab-target]");
  const tabGrids = document.querySelectorAll(".links-grid[data-tab]");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tabTarget;

      // Activar pestaña seleccionada
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Mostrar solo el grid correspondiente
      tabGrids.forEach((grid) => {
        grid.classList.toggle("active", grid.dataset.tab === target);
      });
    });
  });

  // --- Enlaces personalizados por pestaña (Lógica unificada) ---
  const mainToolsCard = document.getElementById("main-tools-card");
  const addLinkBtn = document.getElementById("add-link-btn");
  const toggleDeleteModeBtn = document.getElementById(
    "toggle-delete-mode-btn"
  );
  const CUSTOM_LINKS_PREFIX = "dashboardCustomLinks_";
  const MAX_URL_LENGTH = 1000;

  // *** CONFIGURACIÓN INICIAL DE ENLACES PREDETERMINADOS ***
  const DEFAULT_LINKS = {
    ia: [
      { title: "ChatGPT", subtitle: "Chat general", url: "https://chat.openai.com" },
      { title: "Google Gemini", subtitle: "Google IA", url: "https://gemini.google.com" },
      { title: "Claude", subtitle: "Antropic", url: "https://claude.ai" },
      { title: "Perplexity", subtitle: "Búsqueda IA", url: "https://www.perplexity.ai" },
      { title: "Leonardo AI", subtitle: "Imágenes IA", url: "https://leonardo.ai" },
      { title: "Runway", subtitle: "Video IA", url: "https://runwayml.com" },
      { title: "ElevenLabs", subtitle: "Voz IA", url: "https://elevenlabs.io" },
      { title: "Midjourney Docs", subtitle: "Guía imágenes", url: "https://docs.midjourney.com" },
    ],
    dev: [
      { title: "GitHub", subtitle: "Repositorios", url: "https://github.com" },
      { title: "Stack Overflow", subtitle: "Preguntas dev", url: "https://stackoverflow.com" },
      { title: "GitLab", subtitle: "Repos", url: "https://gitlab.com" },
      { title: "Maven Repository", subtitle: "Dependencias", url: "https://mvnrepository.com" },
      { title: "Spring Docs", subtitle: "Java", url: "https://spring.io/projects/spring-framework" },
      { title: "Quarkus Docs", subtitle: "Java 17", url: "https://quarkus.io/get-started/" },
    ],
    instaladores: [
      { title: "VS Code", subtitle: "Editor", url: "https://code.visualstudio.com/download" },
      { title: "IntelliJ IDEA", subtitle: "Java IDE", url: "https://www.jetbrains.com/idea/download" },
      { title: "Spring Tools Suite", subtitle: "STS", url: "https://spring.io/tools" },
      { title: "JDK 8", subtitle: "Java", url: "https://www.oracle.com/java/technologies/javase-jdk8-downloads.html" },
      { title: "Node.js", subtitle: "Runtime JS", url: "https://nodejs.org/en/download" },
      { title: "Git", subtitle: "Control de versiones", url: "https://git-scm.com/downloads" },
      { title: "Docker Desktop", subtitle: "Contenedores", url: "https://www.docker.com/products/docker-desktop/" },
      { title: "Postman", subtitle: "APIs", url: "https://www.postman.com/downloads/" },
    ],
    diseno: [
      { title: "Canva", subtitle: "Diseño rápido", url: "https://www.canva.com" },
      { title: "Figma", subtitle: "UI / Prototipos", url: "https://www.figma.com" },
      { title: "Freepik", subtitle: "Recursos gráficos", url: "https://www.freepik.com" },
      { title: "Flaticon", subtitle: "Íconos", url: "https://www.flaticon.com" },
      { title: "Photopea", subtitle: "Editor tipo PS", url: "https://www.photopea.com" },
      { title: "Behance", subtitle: "Inspiración", url: "https://www.behance.net" },
    ],
    negocios: [
      { title: "Notion", subtitle: "Organización", url: "https://www.notion.so" },
      { title: "Trello", subtitle: "Tableros", url: "https://trello.com" },
      { title: "Google Calendar", subtitle: "Agenda", url: "https://calendar.google.com" },
      { title: "SAT", subtitle: "Fiscal", url: "https://www.sat.gob.mx" },
      { title: "GBM+", subtitle: "Inversión", url: "https://www.gbm.com" },
      { title: "Kuspit", subtitle: "Inversión", url: "https://www.kuspit.com" },
    ],
    creativo: [
      { title: "Leonardo AI", subtitle: "Arte IA", url: "https://leonardo.ai" },
      { title: "Midjourney Docs", subtitle: "Imágenes", url: "https://docs.midjourney.com" },
      { title: "Runway", subtitle: "Video IA", url: "https://runwayml.com" },
      { title: "ElevenLabs", subtitle: "Voz IA", url: "https://elevenlabs.io" },
      { title: "CapCut Web", subtitle: "Edición video", url: "https://www.capcut.com" },
      { title: "Descript", subtitle: "Podcast / Video", url: "https://www.descript.com" },
    ],
    electronica: [
      { title: "KiCad", subtitle: "PCB", url: "https://www.kicad.org" },
      { title: "EasyEDA", subtitle: "Diseño PCB", url: "https://easyeda.com" },
      { title: "Arduino", subtitle: "Plataforma", url: "https://www.arduino.cc" },
      { title: "Mouser", subtitle: "Componentes", url: "https://www.mouser.com" },
      { title: "Digi-Key", subtitle: "Componentes", url: "https://www.digikey.com" },
      { title: "All About Circuits", subtitle: "Foro", url: "https://forum.allaboutcircuits.com" },
    ],
    cursos: [
      { title: "Udemy", subtitle: "Cursos varios", url: "https://www.udemy.com" },
      { title: "Coursera", subtitle: "Universidades", url: "https://www.coursera.org" },
      { title: "Platzi", subtitle: "Tech", url: "https://platzi.com" },
      { title: "edX", subtitle: "MOOCs", url: "https://www.edx.org" },
      { title: "Domestika", subtitle: "Creativo", url: "https://www.domestika.org" },
      { title: "Hotmart", subtitle: "Venta cursos", url: "https://www.hotmart.com" },
    ],
  };
  // *** FIN DE CONFIGURACIÓN INICIAL ***

  function activeTabId() {
    const activeBtn = document.querySelector(".tab-btn.active");
    return activeBtn ? activeBtn.dataset.tabTarget : null;
  }

  function loadCustomLinks(tabId) {
    const raw = localStorage.getItem(CUSTOM_LINKS_PREFIX + tabId);
    if (!raw) {
      // Si no hay nada en localStorage, devuelve los enlaces predeterminados
      return DEFAULT_LINKS[tabId] || [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_LINKS[tabId] || [];
    }
  }

  function saveCustomLinks(tabId, links) {
    // Solo guardamos si hay enlaces, si no, eliminamos la clave.
    if (links.length > 0) {
      localStorage.setItem(CUSTOM_LINKS_PREFIX + tabId, JSON.stringify(links));
    } else {
      localStorage.removeItem(CUSTOM_LINKS_PREFIX + tabId);
    }
  }

  function createCustomLinkElement(linkData) {
    const { title, subtitle, url } = linkData;
    const a = document.createElement("a");
    // Todos los enlaces ahora son custom-link para poder ser eliminados
    a.className = "link-btn custom-link";
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    // Usaremos un data-atributo para identificar el enlace original al borrar
    a.dataset.originalUrl = url;

    const spanTitle = document.createElement("span");
    spanTitle.textContent = title || "Enlace";

    const small = document.createElement("small");
    small.textContent = subtitle || "Personalizado";

    const del = document.createElement("span");
    del.className = "link-delete";
    del.title = "Eliminar enlace";
    del.textContent = "×";

    a.appendChild(spanTitle);
    a.appendChild(small);
    a.appendChild(del);

    return a;
  }

  // Función para renderizar los enlaces de una pestaña
  function renderLinks(tabId) {
    const grid = document.querySelector(`.links-grid[data-tab="${tabId}"]`);
    if (!grid) return;
    
    // Limpiar el grid antes de renderizar
    grid.innerHTML = ''; 

    // Cargar enlaces (predeterminados o guardados)
    let links = loadCustomLinks(tabId);
    
    // Si es la primera carga y se cargaron los DEFAULT_LINKS, los guardamos para que sean editables.
    // Esto asegura que el usuario pueda eliminar los enlaces predeterminados si lo desea.
    if (localStorage.getItem(CUSTOM_LINKS_PREFIX + tabId) === null && (DEFAULT_LINKS[tabId] || []).length > 0) {
        saveCustomLinks(tabId, links);
    }
    
    // Renderizar
    links.forEach((linkData) => {
      // Pequeña validación
      if (!linkData || typeof linkData.url !== "string" || linkData.url.length > MAX_URL_LENGTH) return;
      try {
        const parsed = new URL(linkData.url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
      } catch {
        return;
      }
      const el = createCustomLinkElement(linkData);
      grid.appendChild(el);
    });
  }
  
  // Render inicial de enlaces: para todas las pestañas
  tabGrids.forEach((grid) => {
    const tabId = grid.dataset.tab;
    renderLinks(tabId);
  });
  

  // Botón: Agregar enlace a la pestaña activa
  if (addLinkBtn) {
    addLinkBtn.addEventListener("click", () => {
      const tabId = activeTabId();
      if (!tabId) return;

      let title = prompt("Nombre del enlace:");
      if (!title) return;
      title = title.trim();
      if (!title) return;
      if (title.length > 80) {
        title = title.slice(0, 80);
      }

      let url = prompt("URL completa (ej. https://ejemplo.com):");
      if (!url) return;
      url = url.trim();
      if (!url) return;

      // Asegurar protocolo
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }

      // Longitud máxima
      if (url.length > MAX_URL_LENGTH) {
        alert("La URL es demasiado larga. Máximo permitido: " + MAX_URL_LENGTH + " caracteres.");
        return;
      }

      // Validar que sea una URL http/https válida
      let parsed;
      try {
        parsed = new URL(url);
      } catch (e) {
        alert("La URL no es válida. Revisa que esté bien escrita.");
        return;
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        alert("Solo se permiten enlaces con protocolo http o https.");
        return;
      }

      let subtitle = prompt(
        "Descripción corta (opcional, por ejemplo: Documentos, Blog, etc.):"
      );
      subtitle = (subtitle || "Personalizado").trim();
      if (subtitle.length > 60) {
        subtitle = subtitle.slice(0, 60);
      }

      const newLink = { title, subtitle, url };
      const grid = document.querySelector(`.links-grid[data-tab="${tabId}"]`);
      if (!grid) return;

      // 1. Añadir al DOM
      const el = createCustomLinkElement(newLink);
      grid.appendChild(el);

      // 2. Añadir a localStorage
      const links = loadCustomLinks(tabId);
      links.push(newLink);
      saveCustomLinks(tabId, links);
      
      // Aseguramos que el modo eliminar esté desactivado después de agregar
      if (mainToolsCard.classList.contains("delete-mode")) {
        mainToolsCard.classList.remove("delete-mode");
        toggleDeleteModeBtn.textContent = "Eliminar";
      }
    });
  }

  // Botón: activar / desactivar modo eliminar
  if (toggleDeleteModeBtn && mainToolsCard) {
    toggleDeleteModeBtn.addEventListener("click", () => {
      const isDeleteMode = mainToolsCard.classList.toggle("delete-mode");
      toggleDeleteModeBtn.textContent = isDeleteMode
        ? "Terminar"
        : "Eliminar";
    });
  }

  // Manejar click en icono de eliminar dentro de enlaces (Ahora aplica a todos)
  if (mainToolsCard) {
    mainToolsCard.addEventListener("click", (event) => {
      const deleteIcon = event.target.closest(".link-delete");
      if (!deleteIcon) return;

      event.preventDefault();
      event.stopPropagation();

      const linkEl = deleteIcon.closest(".custom-link");
      if (!linkEl) return;

      const grid = linkEl.closest(".links-grid");
      const tabId = grid ? grid.dataset.tab : null;
      if (!tabId) return;

      // Usamos el título para la confirmación
      if (!confirm(`¿Eliminar el enlace "${linkEl.querySelector("span")?.textContent}"?`)) return;

      // Borrar del DOM
      linkEl.remove();

      // Actualizar localStorage
      const links = loadCustomLinks(tabId);
      const href = linkEl.getAttribute("href");
      // Buscamos por URL y título para evitar borrar duplicados si solo la URL es igual
      const title = linkEl.querySelector("span")?.textContent || ""; 
      
      const filtered = links.filter(
        (l) => l.url !== href || l.title !== title
      );
      saveCustomLinks(tabId, filtered);
    });
  }

  // --- Notas rápidas con guardado local ---
  const notesEl = document.getElementById("quick-notes");
  const saveNotesBtn = document.getElementById("save-notes-btn");
  const clearNotesBtn = document.getElementById("clear-notes-btn");
  const NOTES_KEY = "dashboardQuickNotes";

  if (notesEl) {
    // Cargar notas guardadas al abrir
    const saved = localStorage.getItem(NOTES_KEY);
    if (saved !== null) {
      notesEl.value = saved;
    }

    // Guardar automáticamente mientras escribes (pequeño delay)
    let saveTimeout;
    notesEl.addEventListener("input", () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        localStorage.setItem(NOTES_KEY, notesEl.value);
      }, 300);
    });
  }

  if (saveNotesBtn && notesEl) {
    saveNotesBtn.addEventListener("click", () => {
      localStorage.setItem(NOTES_KEY, notesEl.value);
      // Podrías mostrar un pequeño mensaje visual, pero lo dejamos simple.
    });
  }

  if (clearNotesBtn && notesEl) {
    clearNotesBtn.addEventListener("click", () => {
      if (!confirm("¿Eliminar la nota rápida actual?")) return;
      notesEl.value = "";
      localStorage.removeItem(NOTES_KEY);
    });
  }
});