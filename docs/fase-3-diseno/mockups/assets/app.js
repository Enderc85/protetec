/* Protetec · maquetas navegables
   JavaScript mínimo para demostrar comportamientos del diseño:
   menú móvil con foco gestionado, envío simulado con estado de carga
   y cierre de avisos. No hay lógica de negocio real ni llamadas a API. */

(function () {
  "use strict";

  /* --- Menú móvil ------------------------------------------------------- */
  var toggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.getAttribute("data-open") === "true";
      mobileNav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
      var firstLink = mobileNav.querySelector("a");
      if (!open && firstLink) firstLink.focus();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && mobileNav.getAttribute("data-open") === "true") {
        mobileNav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* --- Envío simulado: muestra el estado de carga ----------------------- */
  document.querySelectorAll("form[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var button = form.querySelector("[data-submit]");
      if (button) {
        button.classList.add("is-loading");
        button.setAttribute("aria-busy", "true");
        button.setAttribute("aria-disabled", "true");
      }
      var status = form.querySelector("[data-form-status]");
      if (status) {
        status.hidden = false;
        status.focus();
      }
    });
  });

  /* --- Cierre de avisos ------------------------------------------------- */
  document.querySelectorAll("[data-dismiss]").forEach(function (button) {
    button.addEventListener("click", function () {
      var alert = button.closest(".alert");
      if (alert) alert.remove();
    });
  });

  /* --- Modal de demostración -------------------------------------------- */
  var modal = document.querySelector("[data-modal]");
  var modalOpen = document.querySelector("[data-modal-open]");
  var modalClose = document.querySelector("[data-modal-close]");
  var opener = null;

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    if (opener) opener.focus();
  }

  if (modal && modalOpen) {
    modalOpen.addEventListener("click", function () {
      opener = modalOpen;
      modal.hidden = false;
      var focusable = modal.querySelector("button, a, input, textarea, select");
      if (focusable) focusable.focus();
    });
  }
  if (modalClose) modalClose.addEventListener("click", closeModal);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
  });
})();
