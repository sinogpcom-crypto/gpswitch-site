/* Site and product search: own content, company topics, product families and rated values. */
(function (root) {
  "use strict";
  const plurals = {switches:"switch", breakers:"breaker", units:"unit", parts:"part", contacts:"contact", shutters:"shutter", interlocks:"interlock", insulators:"insulator", resistors:"resistor", mechanisms:"mechanism", coils:"coil", trucks:"truck", accessories:"accessory", fuses:"fuse", arresters:"arrester", transformers:"transformer", indicators:"indicator", connectors:"connector", cleats:"cleat", bushings:"bushing", boxes:"box"};
  const normalize = function (value) {
    return String(value || "").normalize("NFKD").toLowerCase()
      .replace(/&(?:amp;)?/g, " and ")
      .replace(/(^|[^a-z0-9])(\d+(?:\.\d+)?)\s*[/(]\s*(\d+(?:\.\d+)?)\)?\s*kv\b/g, "$1$2kv $3kv")
      .replace(/(\d+(?:\.\d+)?)\s*(kv|ka|a|hz)\b/g, "$1$2")
      .replace(/[^a-z0-9.\u4e00-\u9fff]+/g, " ")
      .trim().split(/\s+/).map(function (word) { return plurals[word] || word; }).join(" ")
      .replace(/\bgreen power\b/g, "greenpower").replace(/\bgreenpowerelectric\b/g, "greenpower electric");
  };
  const groups = [
    ["mcs", "Metal-Clad Switchgear", ["metal clad switchgear", "metal enclosed switchgear", "air insulated switchgear"]],
    ["rmu", "Ring Main Unit", ["ring main unit", "rmu"]],
    ["gis", "Gas-Insulated Switchgear", ["gas insulated switchgear", "cgis", "gis"]],
    ["ner", "Neutral Earthing Resistor", ["neutral earthing resistor", "neutral grounding resistor", "grounding resistor", "ner", "ngr"]],
    ["vcb", "Vacuum Circuit Breaker", ["vacuum circuit breaker", "circuit breaker", "vcb"]],
    ["lbs", "Load Break Switch", ["load break switch", "load switch", "lbs"]],
    ["dsw", "Disconnector", ["disconnector switch", "disconnector", "disconnect switch", "isolator"]],
    ["esw", "Earthing Switch", ["earthing switch", "grounding switch"]],
    ["ip", "Insulating Parts", ["insulating part", "epoxy insulator", "insulator", "contact box", "bushing"]],
    ["cc", "Contacts & Copper Parts", ["contact and copper part", "copper part", "tulip contact", "fixed contact", "contact arm", "fuse clip"]],
    ["ch", "Chassis & Functional Trucks", ["vcb chassis truck", "chassis truck", "chassis", "functional truck", "transfer trolley"]],
    ["si", "Shutters & Interlocks", ["shutter and interlock", "earthing switch interlock", "secondary plug interlock", "shutter", "interlock"]],
    ["om", "Operating Mechanisms & Coils", ["operating mechanism", "opening coil", "closing coil", "operating handle"]],
    ["ia", "Cabinet Hardware & Secondary Accessories", ["cabinet hardware", "secondary accessory", "auxiliary switch", "secondary plug", "door hinge", "door lock"]],
    ["cl", "Climate Control & Lighting", ["climate control", "cabinet heater", "dehumidifier", "switchgear lighting", "temperature humidity sensor"]],
    ["ca", "Cable Connectors & Accessories", ["cable connector", "cable accessory", "cable cleat"]],
    ["sa", "Surge Arrester", ["surge arrester", "lightning arrester"]],
    ["clf", "Current-Limiting Fuse", ["current limiting fuse", "hvc fuse"]],
    ["dof", "Drop-Out Fuse Cutout", ["drop out fuse", "fuse cutout"]],
    ["vsi", "Voltage & Status Indication", ["voltage indicator", "fault indicator", "position indicator", "voltage presence", "status indication"]],
    ["ic", "Integrated Control & Condition Monitoring", ["integrated control", "condition monitoring", "wireless temperature"]],
    ["ct", "Instrument Transformers & Metering", ["instrument transformer", "current transformer", "voltage transformer", "power meter"]]
  ];
  const stop = new Set("a an the and or for of to with in on at by please show me your our i we us need looking find product products medium high voltage ac hz electric electrical".split(" "));
  const sitePages = new Set(["/", "/about/", "/factory-quality/", "/applications/", "/projects/", "/downloads/", "/inquiry/"]);
  const brandPriority = {company:1000, home:900, factory:800, projects:700, applications:600, downloads:500, contact:400};
  const siteIntents = [
    ["company", ["about", "about us", "company", "company profile", "company introduction", "who we are"]],
    ["factory", ["factory", "manufacturing", "quality", "quality assurance", "inspection", "certification", "certificates"]],
    ["applications", ["application", "applications", "industries"]],
    ["projects", ["project", "projects", "references", "project references"]],
    ["downloads", ["catalog", "catalogue", "catalogs", "catalogues", "download", "downloads", "brochure"]],
    ["contact", ["contact", "contact us", "inquiry", "enquiry", "request a quote", "quotation", "email", "phone", "address"]],
    ["home", ["home", "homepage"]]
  ];
  const contains = function (text, phrase) { return (" " + text + " ").indexOf(" " + phrase + " ") !== -1; };
  const unique = function (values) { return Array.from(new Set(values)); };
  const parseQuery = function (query) {
    const text = normalize(query).replace(/\bmv\b/g, "medium voltage");
    const brand = contains(text, "greenpower");
    let siteIntent = null;
    siteIntents.forEach(function (entry) {
      entry[1].forEach(function (alias) {
        const phrase = normalize(alias);
        if (contains(text, phrase) && (!siteIntent || phrase.length > siteIntent.phrase.length)) siteIntent = {key:entry[0], phrase:phrase};
      });
    });
    let best = null;
    groups.forEach(function (group) {
      group[2].forEach(function (alias) {
        const phrase = normalize(alias);
        if (contains(text, phrase) && (!best || phrase.length > best.phrase.length)) best = {key:group[0], label:group[1], phrase:phrase};
      });
    });
    // Preserve the product meaning of plural "contacts"; singular "contact us"
    // remains a company/contact intent even though plural normalization is shared.
    if (!best && /\bcontacts\b/i.test(String(query))) best = {key:"cc", label:"Contacts & Copper Parts", phrase:"contact"};
    const family = best ? [best.key] : contains(text, "switchgear") ? ["mcs", "rmu", "gis"] : [];
    return {text:text, brand:brand, siteIntent:siteIntent ? siteIntent.key : "", family:family, label:best ? best.label : family.length ? "Switchgear" : "",
      voltages:unique(Array.from(text.matchAll(/(\d+(?:\.\d+)?)kv\b/g), function (m) { return Number(m[1]); })),
      currents:unique(Array.from(text.matchAll(/(\d+(?:\.\d+)?)a\b/g), function (m) { return Number(m[1]); })),
      tokens:unique(text.split(/\s+/).filter(function (word) { return word.length > 1 && word !== "greenpower" && !stop.has(word); }))};
  };
  const supports = function (values, ranges, requested) {
    return requested.some(function (value) {
      return (values || []).includes(value) || (ranges || []).some(function (range) { return value >= range[0] && value <= range[1]; });
    });
  };
  const search = function (index, query) {
    const q = parseQuery(query);
    if (!q.text || (!q.tokens.length && !q.brand)) return [];
    const brandOnly = q.brand && !q.tokens.length;
    const compact = q.text.replace(/\s+/g, "");
    const knownModels = [];
    index.forEach(function (row) {
      (row.models || []).forEach(function (model) {
        const key = normalize(model).replace(/\s+/g, "");
        if (/(?:kv|ek\d)/.test(key) && compact.includes(key)) knownModels.push(key);
      });
    });
    const longestModel = knownModels.sort(function (a, b) { return b.length - a.length; })[0];
    const siteOnly = brandOnly || (q.siteIntent && !q.family.length && !longestModel && !q.voltages.length && !q.currents.length);
    return index.map(function (row) {
      const productUrl = /^\/products\/(?:[a-z0-9-]+\/)?$/.test(row.url);
      if (!productUrl && !(row.kind === "page" && sitePages.has(row.url))) return null;
      const title = normalize(row.title), description = normalize(row.description);
      const body = normalize(row.bodyText || row.searchText);
      const kind = row.kind || "product";
      if (siteOnly && kind !== "page") return null;
      if (brandOnly) return {row:row, score:brandPriority[row.siteSection] || 0, matches:["GreenPower"], related:false};
      const aliases = normalize((row.aliases || []).join(" "));
      const exactModel = longestModel && (row.models || []).some(function (m) { return normalize(m).replace(/\s+/g, "") === longestModel; });
      if (longestModel && !exactModel) return null;
      if (q.family.length && !q.family.includes(row.category)) return null;
      const voltageMatch = supports(row.voltages, row.voltageRanges, q.voltages);
      const currentMatch = supports(row.currents, row.currentRanges, q.currents);
      if (q.voltages.length && (row.voltages || []).length && !voltageMatch) return null;
      if (q.currents.length && (row.currents || []).length && !currentMatch) return null;
      let score = exactModel ? 1500 : 0;
      if (q.siteIntent && row.siteSection === q.siteIntent) score += 500;
      if (kind === "page" && !q.siteIntent) score -= 40;
      if (q.family.length) score += 100;
      if (kind === "category" && q.family.length && !q.voltages.length && !q.currents.length && !longestModel) score += 400;
      if (voltageMatch) score += 250;
      if (currentMatch) score += 100;
      if (q.voltages.length && !voltageMatch) score -= 60;
      if (q.currents.length && !currentMatch) score -= 30;
      let hits = 0, strongHits = 0;
      q.tokens.forEach(function (token) {
        if (contains(title, token)) { score += 22; hits++; strongHits++; }
        else if (contains(description, token)) { score += 9; hits++; strongHits++; }
        else if (contains(aliases, token)) { score += 12; hits++; strongHits++; }
        else if (contains(body, token)) { score += 2; hits++; }
      });
      if (!q.family.length && !exactModel && !voltageMatch && !currentMatch &&
          (!hits || (!strongHits && hits < Math.ceil(q.tokens.length / 2)))) return null;
      if (kind === "hub") score -= 120;
      const matches = [];
      if (exactModel) matches.push(row.models[0]);
      if (q.label) matches.push(q.label);
      if (voltageMatch) q.voltages.forEach(function (v) { if (supports(row.voltages, row.voltageRanges, [v])) matches.push(v + " kV"); });
      if (currentMatch) q.currents.forEach(function (v) { if (supports(row.currents, row.currentRanges, [v])) matches.push(v + " A"); });
      return {row:row, score:score, matches:unique(matches), related:hits < q.tokens.length};
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score || a.row.url.localeCompare(b.row.url); });
  };
  const PAGE_SIZE = 10;
  const paginate = function (items, requestedPage) {
    const value = String(requestedPage == null ? "1" : requestedPage);
    const number = /^\d+$/.test(value) ? Number(value) : 1;
    const totalPages = Math.ceil(items.length / PAGE_SIZE);
    const page = Math.min(Math.max(Number.isSafeInteger(number) ? number : 1, 1), totalPages || 1);
    const offset = (page - 1) * PAGE_SIZE;
    return {page:page, total:items.length, totalPages:totalPages, start:items.length ? offset + 1 : 0,
      end:Math.min(offset + PAGE_SIZE, items.length), items:items.slice(offset, offset + PAGE_SIZE)};
  };
  const pageNumbers = function (page, totalPages) {
    const numbers = unique([1, page - 1, page, page + 1, totalPages])
      .filter(function (n) { return n >= 1 && n <= totalPages; }).sort(function (a, b) { return a - b; });
    const result = [];
    numbers.forEach(function (number, i) {
      const previous = numbers[i - 1];
      if (previous && number - previous === 2) result.push(previous + 1);
      else if (previous && number - previous > 2) result.push(null);
      result.push(number);
    });
    return result;
  };
  const pageUrl = function (href, query, page) {
    const url = new URL(href);
    url.searchParams.set("q", query);
    url.searchParams.delete("page");
    if (page > 1) url.searchParams.set("page", String(page));
    url.hash = "productSearchStatus";
    return url.pathname + url.search + url.hash;
  };
  const api = {normalize:normalize, parseQuery:parseQuery, search:search, paginate:paginate, pageNumbers:pageNumbers, pageUrl:pageUrl};
  if (typeof module === "object" && module.exports) { module.exports = api; return; }
  root.GPSwitchProductSearch = api;
  const status = document.getElementById("productSearchStatus");
  const list = document.getElementById("productSearchResults");
  const input = document.getElementById("productSearchQuery");
  const pagination = document.getElementById("productSearchPagination");
  if (!status || !list) return;
  const params = new URLSearchParams(root.location.search);
  const query = params.get("q") || "";
  if (input) input.value = query;
  const escape = function (text) { return String(text).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); };
  const renderPagination = function (page) {
    if (!pagination) return;
    pagination.hidden = page.totalPages <= 1;
    if (pagination.hidden) { pagination.innerHTML = ""; return; }
    const href = function (n) { return escape(pageUrl(root.location.href, query, n)); };
    const previous = page.page > 1 ? '<a class="product-search-page" rel="prev" href="' + href(page.page - 1) + '">Previous</a>' :
      '<span class="product-search-page" aria-disabled="true">Previous</span>';
    const next = page.page < page.totalPages ? '<a class="product-search-page" rel="next" href="' + href(page.page + 1) + '">Next</a>' :
      '<span class="product-search-page" aria-disabled="true">Next</span>';
    pagination.innerHTML = previous + pageNumbers(page.page, page.totalPages).map(function (number) {
      if (number === null) return '<span class="product-search-ellipsis" aria-hidden="true">&hellip;</span>';
      if (number === page.page) return '<span class="product-search-page" aria-current="page" aria-label="Page ' + number + '">' + number + '</span>';
      return '<a class="product-search-page" aria-label="Page ' + number + '" href="' + href(number) + '">' + number + '</a>';
    }).join("") + next;
  };
  const render = function (index) {
    if (!query.trim()) { status.textContent = "Enter a product name, company topic, model, or keyword above, then press Search or Enter."; list.hidden = true; list.innerHTML = ""; renderPagination(paginate([], 1)); return; }
    const results = search(index, query);
    const page = paginate(results, params.get("page"));
    status.textContent = results.length ? "Showing " + page.start + "–" + page.end + " of " + page.total + " results." : "No matching content found. Try a product, company topic, model, or keyword.";
    if (results.length && results[0].related) status.textContent += " Showing related content for your search.";
    list.hidden = !results.length;
    list.innerHTML = page.items.map(function (item) {
      const row = item.row;
      return '<li><a href="' + escape(row.url) + '"><strong>' + escape(row.title) + '</strong><span class="product-search-snippet">' + escape(row.description || "") + '</span>' +
        (item.matches.length ? '<span class="product-search-snippet">Matched: ' + escape(item.matches.join(" · ")) + '</span>' : "") +
        '<span class="product-search-url">' + escape(row.url) + '</span></a></li>';
    }).join("");
    renderPagination(page);
    // Real links preserve native back/forward navigation and can be bookmarked.
    if (params.has("page") && params.get("page") !== (page.page > 1 ? String(page.page) : "")) {
      const url = new URL(root.location.href);
      url.searchParams.delete("page");
      if (page.page > 1) url.searchParams.set("page", String(page.page));
      if (root.history && root.history.replaceState) root.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
    if (root.location.hash === "#productSearchStatus") {
      status.focus({preventScroll:true});
      status.scrollIntoView({block:"start", behavior:"auto"});
    }
  };
  const load = function () {
    const template = document.getElementById("gpswitch-product-search-index-b64");
    if (template) {
      try {
        const raw = (template.content ? template.content.textContent : template.textContent).replace(/\s+/g, "");
        const bin = atob(raw), bytes = Uint8Array.from(bin, function (c) { return c.charCodeAt(0); });
        const index = JSON.parse(new TextDecoder("utf-8").decode(bytes));
        if (Array.isArray(index)) return Promise.resolve(index);
      } catch (error) { /* Use the external copy if the embedded copy is unavailable. */ }
    }
    return fetch("/statics/web/data/product-search-index.json?v=20261028-category-urls", {credentials:"same-origin"}).then(function (response) {
      if (!response.ok) throw new Error("Index unavailable");
      return response.json();
    });
  };
  load().then(function (index) {
    if (!Array.isArray(index)) throw new Error("Invalid index");
    render(index);
  }).catch(function () { status.textContent = "Search is temporarily unavailable. Please refresh or browse the site."; list.hidden = true; renderPagination(paginate([], 1)); });
}(typeof window === "undefined" ? globalThis : window));
