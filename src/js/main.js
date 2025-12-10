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

  // --- Enlaces personalizados por pestaña ---
  const mainToolsCard = document.getElementById("main-tools-card");
  const addLinkBtn = document.getElementById("add-link-btn");
  const toggleDeleteModeBtn = document.getElementById(
    "toggle-delete-mode-btn"
  );
  const CUSTOM_LINKS_PREFIX = "dashboardCustomLinks_";
  const MAX_URL_LENGTH = 1000;

  function activeTabId() {
    const activeBtn = document.querySelector(".tab-btn.active");
    return activeBtn ? activeBtn.dataset.tabTarget : null;
  }

  function loadCustomLinks(tabId) {
    const raw = localStorage.getItem(CUSTOM_LINKS_PREFIX + tabId);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  function saveCustomLinks(tabId, links) {
    localStorage.setItem(CUSTOM_LINKS_PREFIX + tabId, JSON.stringify(links));
  }

  function createCustomLinkElement(linkData) {
    const { title, subtitle, url } = linkData;
    const a = document.createElement("a");
    a.className = "link-btn custom-link";
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

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

  // Render inicial de enlaces personalizados
  tabGrids.forEach((grid) => {
    const tabId = grid.dataset.tab;
    const customLinks = loadCustomLinks(tabId);
    customLinks.forEach((linkData) => {
      // Pequeña validación al cargar, por si hubiera basura en localStorage
      if (!linkData || typeof linkData.url !== "string") return;
      if (linkData.url.length > MAX_URL_LENGTH) return;
      try {
        const parsed = new URL(linkData.url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return;
        }
      } catch {
        return;
      }
      const el = createCustomLinkElement(linkData);
      grid.appendChild(el);
    });
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

      const el = createCustomLinkElement(newLink);
      grid.appendChild(el);

      const links = loadCustomLinks(tabId);
      links.push(newLink);
      saveCustomLinks(tabId, links);
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

  // Manejar click en icono de eliminar dentro de enlaces personalizados
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

      // Borrar del DOM
      linkEl.remove();

      // Actualizar localStorage
      const links = loadCustomLinks(tabId);
      const href = linkEl.getAttribute("href");
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
