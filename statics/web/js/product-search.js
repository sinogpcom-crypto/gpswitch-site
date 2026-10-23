/* Product relevance search: own content, product families and rated values. */
(function (root) {
  "use strict";
  const plurals = {switches:"switch", breakers:"breaker", units:"unit", parts:"part", contacts:"contact", shutters:"shutter", interlocks:"interlock", insulators:"insulator", resistors:"resistor", mechanisms:"mechanism", coils:"coil", trucks:"truck", accessories:"accessory", fuses:"fuse", arresters:"arrester", transformers:"transformer", indicators:"indicator", connectors:"connector", cleats:"cleat", bushings:"bushing", boxes:"box"};
  const normalize = function (value) {
    return String(value || "").normalize("NFKD").toLowerCase()
      .replace(/&(?:amp;)?/g, " and ")
      .replace(/(^|[^a-z0-9])(\d+(?:\.\d+)?)\s*[/(]\s*(\d+(?:\.\d+)?)\)?\s*kv\b/g, "$1$2kv $3kv")
      .replace(/(\d+(?:\.\d+)?)\s*(kv|ka|a|hz)\b/g, "$1$2")
      .replace(/[^a-z0-9.\u4e00-\u9fff]+/g, " ")
      .trim().split(/\s+/).map(function (word) { return plurals[word] || word; }).join(" ");
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
    ["fc", "Vacuum Contactor-Fuse Combination", ["vacuum contactor fuse combination", "vacuum contactor", "contactor fuse"]],
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
  const stop = new Set("a an the and or for of to with in on at by please show me your our i we need looking find product products medium high voltage ac hz electric electrical greenpower".split(" "));
  const contains = function (text, phrase) { return (" " + text + " ").indexOf(" " + phrase + " ") !== -1; };
  const unique = function (values) { return Array.from(new Set(values)); };
  const parseQuery = function (query) {
    const text = normalize(query).replace(/\bmv\b/g, "medium voltage");
    let best = null;
    groups.forEach(function (group) {
      group[2].forEach(function (alias) {
        const phrase = normalize(alias);
        if (contains(text, phrase) && (!best || phrase.length > best.phrase.length)) best = {key:group[0], label:group[1], phrase:phrase};
      });
    });
    const family = best ? [best.key] : contains(text, "switchgear") ? ["mcs", "rmu", "gis"] : [];
    return {text:text, family:family, label:best ? best.label : family.length ? "Switchgear" : "",
      voltages:unique(Array.from(text.matchAll(/(\d+(?:\.\d+)?)kv\b/g), function (m) { return Number(m[1]); })),
      currents:unique(Array.from(text.matchAll(/(\d+(?:\.\d+)?)a\b/g), function (m) { return Number(m[1]); })),
      tokens:unique(text.split(/\s+/).filter(function (word) { return word.length > 1 && !stop.has(word); }))};
  };
  const supports = function (values, ranges, requested) {
    return requested.some(function (value) {
      return (values || []).includes(value) || (ranges || []).some(function (range) { return value >= range[0] && value <= range[1]; });
    });
  };
  const search = function (index, query) {
    const q = parseQuery(query);
    if (!q.text || !q.tokens.length) return [];
    const compact = q.text.replace(/\s+/g, "");
    const knownModels = [];
    index.forEach(function (row) {
      (row.models || []).forEach(function (model) {
        const key = normalize(model).replace(/\s+/g, "");
        if (/(?:kv|ek\d)/.test(key) && compact.includes(key)) knownModels.push(key);
      });
    });
    const longestModel = knownModels.sort(function (a, b) { return b.length - a.length; })[0];
    return index.map(function (row) {
      if (!/^\/products\/(?:[a-z0-9-]+\/)?$/.test(row.url)) return null;
      const title = normalize(row.title), description = normalize(row.description);
      const body = normalize(row.bodyText || row.searchText);
      const kind = row.kind || "product";
      const exactModel = longestModel && (row.models || []).some(function (m) { return normalize(m).replace(/\s+/g, "") === longestModel; });
      if (longestModel && !exactModel) return null;
      if (q.family.length && !q.family.includes(row.category)) return null;
      const voltageMatch = supports(row.voltages, row.voltageRanges, q.voltages);
      const currentMatch = supports(row.currents, row.currentRanges, q.currents);
      if (q.voltages.length && (row.voltages || []).length && !voltageMatch) return null;
      if (q.currents.length && (row.currents || []).length && !currentMatch) return null;
      let score = exactModel ? 1500 : 0;
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
  const api = {normalize:normalize, parseQuery:parseQuery, search:search};
  if (typeof module === "object" && module.exports) { module.exports = api; return; }
  root.GPSwitchProductSearch = api;
  const status = document.getElementById("productSearchStatus");
  const list = document.getElementById("productSearchResults");
  const input = document.getElementById("productSearchQuery");
  if (!status || !list) return;
  const query = new URLSearchParams(root.location.search).get("q") || "";
  if (input) input.value = query;
  const escape = function (text) { return String(text).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); };
  const render = function (index) {
    if (!query.trim()) { status.textContent = "Enter a product name, model, or keyword above, then press Search or Enter."; list.hidden = true; list.innerHTML = ""; return; }
    const results = search(index, query);
    status.textContent = results.length ? results.length + " relevant product page" + (results.length === 1 ? "" : "s") + " found." : "No related products found. Try a product type, model, or voltage, or browse the product catalog.";
    if (results.length && results[0].related) status.textContent += " Showing related products for your search.";
    list.hidden = !results.length;
    list.innerHTML = results.map(function (item) {
      const row = item.row;
      return '<li><a href="' + escape(row.url) + '"><strong>' + escape(row.title) + '</strong><span class="product-search-snippet">' + escape(row.description || "") + '</span>' +
        (item.matches.length ? '<span class="product-search-snippet">Matched: ' + escape(item.matches.join(" · ")) + '</span>' : "") +
        '<span class="product-search-url">' + escape(row.url) + '</span></a></li>';
    }).join("");
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
    return fetch("/statics/web/data/product-search-index.json?v=20261023", {credentials:"same-origin"}).then(function (response) {
      if (!response.ok) throw new Error("Index unavailable");
      return response.json();
    });
  };
  load().then(function (index) {
    if (!Array.isArray(index)) throw new Error("Invalid index");
    render(index);
  }).catch(function () { status.textContent = "Product search is temporarily unavailable. Please refresh or browse the product catalog."; list.hidden = true; });
}(typeof window === "undefined" ? globalThis : window));
