(function () {
  "use strict";

  var ENDPOINT = "https://script.google.com/macros/s/AKfycbxH5hUwNB3jLUKjMPxvrI7LryUPbsT1ixZ1E3nvGV0PJJxHe44pHzNnad4_PAQg-WJbVg/exec";
  var SUCCESS_MESSAGE = "Thank you! Your download will start shortly.";
  var ERROR_MESSAGE = "Something went wrong. Please try again.";
  var THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  var STORAGE_KEYS = {
    name: "catalog_name",
    email: "catalog_email",
    company: "catalog_company",
    timestamp: "catalog_timestamp"
  };

  var modal;
  var form;
  var productInput;
  var fileInput;
  var messageEl;
  var submitButton;
  var lastFocusedElement;
  var currentFilePath = "";

  function createModal() {
    modal = document.createElement("div");
    modal.id = "catalog-download-modal";
    modal.className = "catalog-download-modal";
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML =
      '<button type="button" class="catalog-download-modal__overlay" data-catalog-modal-close aria-label="Close dialog"></button>' +
      '<div class="catalog-download-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="catalog-download-modal-title">' +
      '<button type="button" class="catalog-download-modal__close" data-catalog-modal-close aria-label="Close">&times;</button>' +
      '<h2 id="catalog-download-modal-title" class="catalog-download-modal__title">Download Catalog</h2>' +
      '<p class="catalog-download-modal__intro">Please complete the form below. Your catalog download will begin after submission.</p>' +
      '<form class="catalog-download-form" id="catalog-download-form" novalidate>' +
      '<input type="hidden" name="product" id="catalog-download-product">' +
      '<input type="hidden" name="file" id="catalog-download-file">' +
      '<label class="field"><span>Full Name *</span><input type="text" name="name" id="catalog-download-name" autocomplete="name" required></label>' +
      '<label class="field"><span>Email *</span><input type="email" name="email" id="catalog-download-email" autocomplete="email" required></label>' +
      '<label class="field"><span>Company *</span><input type="text" name="company" id="catalog-download-company" autocomplete="organization" required></label>' +
      '<button type="submit" class="button button-primary" id="catalog-download-submit">Download Catalog</button>' +
      '<p class="catalog-download-modal__message" id="catalog-download-message" role="status" hidden></p>' +
      "</form></div>";

    document.body.appendChild(modal);

    form = modal.querySelector("#catalog-download-form");
    productInput = modal.querySelector("#catalog-download-product");
    fileInput = modal.querySelector("#catalog-download-file");
    messageEl = modal.querySelector("#catalog-download-message");
    submitButton = modal.querySelector("#catalog-download-submit");

    modal.querySelectorAll("[data-catalog-modal-close]").forEach(function (node) {
      node.addEventListener("click", closeModal);
    });

    form.addEventListener("submit", handleSubmit);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });
  }

  function resolveProductName(trigger) {
    if (trigger && trigger.getAttribute("data-catalog-product")) {
      return trigger.getAttribute("data-catalog-product").trim();
    }
    var model = document.querySelector(".product-hero-model");
    var name = document.querySelector(".product-hero-name");
    if (model && name) {
      return (model.textContent.trim() + " " + name.textContent.trim()).trim();
    }
    var title = document.title || "";
    return title.split("|")[0].trim();
  }

  function resolveFilePath(trigger) {
    if (trigger && trigger.getAttribute("data-catalog-file")) {
      return trigger.getAttribute("data-catalog-file").trim();
    }
    return "";
  }

  function getStoredContact() {
    try {
      var name = localStorage.getItem(STORAGE_KEYS.name);
      var email = localStorage.getItem(STORAGE_KEYS.email);
      var company = localStorage.getItem(STORAGE_KEYS.company);
      var timestamp = localStorage.getItem(STORAGE_KEYS.timestamp);

      if (!name || !email || !company || !timestamp) {
        return null;
      }

      return {
        name: name,
        email: email,
        company: company,
        timestamp: Number(timestamp)
      };
    } catch (error) {
      return null;
    }
  }

  function isCatalogContactValid() {
    var stored = getStoredContact();
    if (!stored || !stored.timestamp) {
      return false;
    }
    return Date.now() - stored.timestamp < THIRTY_DAYS_MS;
  }

  function loadCatalogContactFromStorage() {
    if (!form) {
      return;
    }

    try {
      var name = localStorage.getItem(STORAGE_KEYS.name);
      var email = localStorage.getItem(STORAGE_KEYS.email);
      var company = localStorage.getItem(STORAGE_KEYS.company);

      if (name) {
        form.elements.name.value = name;
      }
      if (email) {
        form.elements.email.value = email;
      }
      if (company) {
        form.elements.company.value = company;
      }
    } catch (error) {
      // Ignore storage access errors in restricted browser modes.
    }
  }

  function saveCatalogContactToStorage(nameValue, emailValue, companyValue) {
    try {
      localStorage.setItem(STORAGE_KEYS.name, nameValue);
      localStorage.setItem(STORAGE_KEYS.email, emailValue);
      localStorage.setItem(STORAGE_KEYS.company, companyValue);
      localStorage.setItem(STORAGE_KEYS.timestamp, String(Date.now()));
    } catch (error) {
      // Ignore storage access errors in restricted browser modes.
    }
  }

  function submitCatalogData(payload) {
    fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).catch(function () {
      // Silent failure for background submissions.
    });
  }

  function submitCatalogDataSilently(trigger) {
    try {
      fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: localStorage.getItem(STORAGE_KEYS.name),
          email: localStorage.getItem(STORAGE_KEYS.email),
          company: localStorage.getItem(STORAGE_KEYS.company),
          product: trigger.getAttribute("data-catalog-product"),
          file: trigger.getAttribute("data-catalog-file")
        })
      }).catch(function () {
        // Silent failure for background submissions.
      });
    } catch (error) {
      // Ignore storage access errors in restricted browser modes.
    }
  }

  function handleDownloadClick(trigger) {
    var filePath = resolveFilePath(trigger);

    if (!filePath) {
      return;
    }

    if (isCatalogContactValid()) {
      submitCatalogDataSilently(trigger);
      window.setTimeout(function () {
        triggerDownload(filePath);
      }, 100);
      return;
    }

    openModal(trigger);
  }

  function openModal(trigger) {
    if (!modal) {
      createModal();
    }
    currentFilePath = resolveFilePath(trigger);
    hideMessage();
    form.reset();
    productInput.value = resolveProductName(trigger);
    fileInput.value = currentFilePath;
    loadCatalogContactFromStorage();
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("catalog-download-modal-open");
    var nameField = modal.querySelector("#catalog-download-name");
    if (nameField) {
      window.setTimeout(function () {
        nameField.focus();
      }, 0);
    }
  }

  function closeModal() {
    if (!modal || modal.hidden) {
      return;
    }
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("catalog-download-modal-open");
    submitButton.disabled = false;
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function hideMessage() {
    messageEl.hidden = true;
    messageEl.textContent = "";
    messageEl.classList.remove("is-success", "is-error");
  }

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.hidden = false;
    messageEl.classList.remove("is-success", "is-error");
    messageEl.classList.add(type === "success" ? "is-success" : "is-error");
  }

  function triggerDownload(fileUrl) {
    if (!fileUrl) {
      return;
    }
    window.open(fileUrl, "_blank");
  }

  function handleSubmit(event) {
    event.preventDefault();
    hideMessage();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var nameValue = form.elements.name.value.trim();
    var emailValue = form.elements.email.value.trim();
    var companyValue = form.elements.company.value.trim();
    var productValue = productInput.value;
    var fileValue = fileInput.value;
    submitButton.disabled = true;

    submitCatalogData({
      name: nameValue,
      email: emailValue,
      company: companyValue,
      product: productValue,
      file: fileValue
    });

    saveCatalogContactToStorage(nameValue, emailValue, companyValue);
    triggerDownload(fileValue);
    closeModal();
  }

  function bindTriggers() {
    document.querySelectorAll(".js-catalog-download").forEach(function (trigger) {
      if (trigger.dataset.catalogBound === "true") {
        return;
      }
      trigger.dataset.catalogBound = "true";
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        handleDownloadClick(trigger);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindTriggers);
  } else {
    bindTriggers();
  }
}());
