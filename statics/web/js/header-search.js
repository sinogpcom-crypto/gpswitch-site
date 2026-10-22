(function () {
  "use strict";
  const trigger = document.querySelector("[data-header-search-trigger]");
  const dialog = document.querySelector("#site-search-dialog");
  if (!trigger || !dialog || dialog.dataset.searchReady === "true") return;
  dialog.dataset.searchReady = "true";

  const input = dialog.querySelector(".header-search-input");
  const form = dialog.querySelector(".header-search-form");
  const clear = dialog.querySelector("[data-header-search-clear]");
  const closeButton = dialog.querySelector("[data-header-search-close]");
  let backdropPointerDown = false;
  let previousOverflow = "";
  let locked = false;

  const syncClear = function () {
    clear.hidden = input.value.length === 0;
  };

  const positionDialog = function () {
    const viewport = window.visualViewport;
    const height = viewport ? viewport.height : window.innerHeight;
    const offset = viewport ? viewport.offsetTop : 0;
    const mobile = window.matchMedia("(max-width: 600px)").matches;
    const header = document.querySelector(".site-header");
    const headerBottom = header ? header.getBoundingClientRect().bottom : 80;
    const top = mobile ? offset + 16 : Math.min(Math.max(16, headerBottom + 8), offset + Math.max(16, height - 280));
    dialog.style.setProperty("--header-search-top", top + "px");
    dialog.style.setProperty("--header-search-max-height", Math.max(120, height - (top - offset) - 16) + "px");
  };

  const closeMenus = function () {
    document.querySelectorAll(".nav-dropdown.is-open, .qr-panel.is-open").forEach(function (panel) {
      panel.classList.remove("is-open");
    });
    document.querySelectorAll(".product-menu-trigger, [data-about-trigger], .header-qr .tool-button").forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
  };

  const openSearch = function () {
    if (dialog.open) return;
    closeMenus();
    positionDialog();
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    locked = true;
    dialog.showModal();
    trigger.setAttribute("aria-expanded", "true");
    syncClear();
    window.requestAnimationFrame(function () {
      if (dialog.open) input.focus({ preventScroll: true });
    });
  };

  const closeSearch = function () {
    if (dialog.open) dialog.close();
  };

  trigger.addEventListener("click", openSearch);
  closeButton.addEventListener("click", closeSearch);
  input.addEventListener("input", syncClear);

  clear.addEventListener("click", function () {
    input.value = "";
    syncClear();
    input.focus({ preventScroll: true });
  });

  form.addEventListener("submit", function (event) {
    input.value = input.value.trim();
    syncClear();
    if (!input.value) {
      event.preventDefault();
      input.focus({ preventScroll: true });
    }
  });

  dialog.querySelectorAll("[data-header-search-term]").forEach(function (button) {
    button.addEventListener("click", function () {
      input.value = button.getAttribute("data-header-search-term") || "";
      syncClear();
      form.requestSubmit();
    });
  });

  const outsideDialog = function (event) {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  dialog.addEventListener("pointerdown", function (event) {
    backdropPointerDown = event.target === dialog && outsideDialog(event);
  });
  dialog.addEventListener("click", function (event) {
    if (backdropPointerDown && event.target === dialog && outsideDialog(event)) closeSearch();
    backdropPointerDown = false;
  });
  dialog.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeSearch();
    }
  }, true);
  dialog.addEventListener("close", function () {
    trigger.setAttribute("aria-expanded", "false");
    if (locked) {
      document.documentElement.style.overflow = previousOverflow;
      locked = false;
    }
    backdropPointerDown = false;
    trigger.focus({ preventScroll: true });
  });

  window.addEventListener("resize", function () {
    if (dialog.open) positionDialog();
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", function () {
      if (dialog.open) positionDialog();
    });
    window.visualViewport.addEventListener("scroll", function () {
      if (dialog.open) positionDialog();
    });
  }

  if (window.location.pathname.replace(/\/+$/, "") === "/search") {
    input.value = new URLSearchParams(window.location.search).get("q") || "";
  }
  syncClear();
}());

