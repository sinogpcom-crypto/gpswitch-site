(function () {
  "use strict";

  const directory = document.querySelector(".products-gateway-layout");
  if (!directory) {
    return;
  }

  const tabs = Array.from(directory.querySelectorAll("[data-products-tab]"));
  const panels = Array.from(directory.querySelectorAll(".products-panel"));
  const aliases = {
    "system-earthing-protection": "protection-monitoring",
    "instrument-transformers": "protection-monitoring"
  };

  const hasCategory = function (key) {
    return tabs.some(function (tab) {
      return tab.getAttribute("data-products-tab") === key;
    }) && panels.some(function (panel) {
      return panel.id === "products-panel-" + key;
    });
  };

  const scrollToCategory = function (key) {
    window.requestAnimationFrame(function () {
      const panel = panels.find(function (item) {
        return item.id === "products-panel-" + key;
      });
      const grid = panel.querySelector(".products-card-grid");
      if (!grid) {
        return;
      }

      const reducedMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: Math.max(window.scrollY + grid.getBoundingClientRect().top - 110, 0),
        behavior: reducedMotion ? "auto" : "smooth"
      });
    });
  };

  const selectCategory = function (key, scroll) {
    if (!hasCategory(key)) {
      return false;
    }

    tabs.forEach(function (tab) {
      const active = tab.getAttribute("data-products-tab") === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    panels.forEach(function (panel) {
      const active = panel.id === "products-panel-" + key;
      panel.classList.toggle("is-active", active);
      panel.setAttribute("aria-hidden", active ? "false" : "true");
    });

    if (scroll) {
      scrollToCategory(key);
    }
    return true;
  };

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      const key = tab.getAttribute("data-products-tab");
      if (selectCategory(key, true)) {
        window.history.replaceState(window.history.state, "", "#" + key);
      }
    });
  });

  const selectFromHash = function () {
    const key = window.location.hash.slice(1);
    if (!selectCategory(Object.prototype.hasOwnProperty.call(aliases, key) ? aliases[key] : key, true)) {
      selectCategory("mv-switchgear", false);
    }
  };

  selectFromHash();
  window.addEventListener("hashchange", selectFromHash);
}());
