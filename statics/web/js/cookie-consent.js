(function () {
  "use strict";

  const ANALYTICS_ID = "G-BYYEXMD4H0";
  const STORAGE_KEY = "greenpower_cookie_consent_v1";
  const CONSENT_LIFETIME_MS = 180 * 24 * 60 * 60 * 1000;
  const PRODUCTION_HOSTS = ["gpswitch.com", "www.gpswitch.com"];
  let memoryPreference = null;
  let analyticsStarted = false;

  const readPreference = function () {
    let storedValue = null;

    try {
      storedValue = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      storedValue = memoryPreference;
    }

    if (!storedValue) {
      return null;
    }

    try {
      const preference = JSON.parse(storedValue);
      const validChoice = preference.choice === "accepted" || preference.choice === "rejected";

      if (!validChoice || typeof preference.expiresAt !== "number" || preference.expiresAt <= Date.now()) {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          memoryPreference = null;
        }
        return null;
      }

      return preference.choice;
    } catch (error) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (storageError) {
        memoryPreference = null;
      }
      return null;
    }
  };

  const savePreference = function (choice) {
    const value = JSON.stringify({
      choice: choice,
      expiresAt: Date.now() + CONSENT_LIFETIME_MS
    });

    memoryPreference = value;

    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      // The choice still applies to the current page if browser storage is unavailable.
    }

    document.documentElement.setAttribute("data-cookie-consent", choice);
  };

  const loadAnalytics = function () {
    if (analyticsStarted || PRODUCTION_HOSTS.indexOf(window.location.hostname) === -1) {
      return;
    }

    analyticsStarted = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", ANALYTICS_ID, { anonymize_ip: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ANALYTICS_ID);
    script.setAttribute("data-greenpower-analytics", "true");
    document.head.appendChild(script);
  };

  const createBanner = function () {
    const banner = document.createElement("aside");
    banner.className = "cookie-consent";
    banner.id = "cookieConsent";
    banner.hidden = true;
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "cookieConsentTitle");
    banner.setAttribute("aria-describedby", "cookieConsentText");
    banner.innerHTML = [
      '<div class="cookie-consent__inner">',
      '  <div class="cookie-consent__copy">',
      '    <h2 class="cookie-consent__title" id="cookieConsentTitle">Cookie preferences</h2>',
      '    <p class="cookie-consent__text" id="cookieConsentText">We use essential browser storage and optional analytics to understand how visitors use our website. You can accept or reject optional analytics. <a href="/privacy/">Read our Privacy Policy</a>.</p>',
      '  </div>',
      '  <div class="cookie-consent__actions">',
      '    <button class="cookie-consent__button cookie-consent__button--reject" type="button" data-cookie-reject>Reject analytics</button>',
      '    <button class="cookie-consent__button cookie-consent__button--accept" type="button" data-cookie-accept>Accept analytics</button>',
      '  </div>',
      '</div>'
    ].join("");
    document.body.appendChild(banner);
    return banner;
  };

  const installFooterControls = function () {
    const existingFooter = document.querySelector(".footer-bottom-inner");

    if (existingFooter) {
      if (existingFooter.querySelector("[data-cookie-settings]")) {
        return;
      }

      const legalLinks = document.createElement("div");
      legalLinks.className = "footer-legal-links";

      const privacyLink = document.createElement("a");
      privacyLink.href = "/privacy/";
      privacyLink.textContent = "Privacy Policy";
      if (window.location.pathname === "/privacy/") {
        privacyLink.setAttribute("aria-current", "page");
      }

      const settingsButton = document.createElement("button");
      settingsButton.className = "footer-cookie-settings";
      settingsButton.type = "button";
      settingsButton.textContent = "Cookie Settings";
      settingsButton.setAttribute("data-cookie-settings", "");

      const backToTop = existingFooter.querySelector('a[href="#top"]');
      legalLinks.appendChild(privacyLink);
      legalLinks.appendChild(settingsButton);
      if (backToTop) {
        legalLinks.appendChild(backToTop);
      }
      existingFooter.appendChild(legalLinks);
      return;
    }

    const main = document.querySelector("main");
    if (!main) {
      return;
    }

    const strip = document.createElement("div");
    strip.className = "site-legal-strip";
    strip.innerHTML = [
      '<div class="container site-legal-strip__inner">',
      '  <a href="/privacy/">Privacy Policy</a>',
      '  <button class="site-legal-strip__button" type="button" data-cookie-settings>Cookie Settings</button>',
      '</div>'
    ].join("");
    main.insertAdjacentElement("afterend", strip);
  };

  const initialiseConsent = function () {
    installFooterControls();

    const banner = createBanner();
    const acceptButton = banner.querySelector("[data-cookie-accept]");
    const rejectButton = banner.querySelector("[data-cookie-reject]");
    const preference = readPreference();

    if (preference) {
      document.documentElement.setAttribute("data-cookie-consent", preference);
    } else {
      banner.hidden = false;
    }

    if (preference === "accepted") {
      loadAnalytics();
    }

    acceptButton.addEventListener("click", function () {
      savePreference("accepted");
      banner.hidden = true;
      loadAnalytics();
    });

    rejectButton.addEventListener("click", function () {
      const shouldReload = analyticsStarted;
      savePreference("rejected");
      banner.hidden = true;

      if (shouldReload) {
        window.location.reload();
      }
    });

    document.addEventListener("click", function (event) {
      const settingsButton = event.target.closest("[data-cookie-settings]");
      if (!settingsButton) {
        return;
      }

      event.preventDefault();
      banner.hidden = false;
      rejectButton.focus();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseConsent);
  } else {
    initialiseConsent();
  }
}());
