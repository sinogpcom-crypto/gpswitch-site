#!/usr/bin/env python3
"""Rebuild the site search index from product pages and selected public site pages."""

import base64
import json
import re
from pathlib import Path
from html import unescape
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "statics/web/data/product-search-index.json"
PRODUCT_SEARCH_HTML = ROOT / "search/index.html"
B64_MARKER = "__GPSWITCH_EMBED_PRODUCT_SEARCH_V1__"


def clean_product_url(source_path: Path) -> str:
    relative = source_path.relative_to(ROOT).as_posix()
    if relative == "products/index.html":
        return "/products/"
    if relative.startswith("products/") and relative.endswith("/index.html"):
        return "/" + relative.removesuffix("index.html")
    raise ValueError(f"Unexpected product page path: {relative}")


def product_source_paths() -> list[Path]:
    hub = ROOT / "products/index.html"
    detail_pages = sorted((ROOT / "products").glob("*/index.html"))
    excluded = {"vacuum-contactor-fuse-combinations", "vacuum-interrupters", "compact-secondary-substation", "test-and-diagnostic-tools", "system-earthing-protection", "metering-and-monitoring-devices"}
    return [hub, *(p for p in detail_pages if p.parent.name not in excluded and re.search(r'<h1[ >]', p.read_text(encoding="utf-8"), re.I))]


def strip_tags(s: str) -> str:
    return unescape(re.sub(r"<[^>]+>", " ", s))


def norm_space(s: str) -> str:
    return " ".join(s.split())


def extract_h1(html: str) -> str:
    m = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", html, re.I)
    if not m:
        return ""
    return norm_space(strip_tags(m.group(1)))


def extract_card_snippets(html: str) -> str:
    chunks = []
    for m in re.finditer(
        r'<div class="products-card-body"[^>]*>([\s\S]*?)</div>\s*</article>',
        html,
    ):
        block = m.group(1)
        h2 = re.search(r"<h2[^>]*>([\s\S]*?)</h2>", block, re.I)
        p = re.search(r"</h2>\s*<p[^>]*>([\s\S]*?)</p>", block, re.I)
        if h2:
            t = norm_space(strip_tags(h2.group(1)))
            d = norm_space(strip_tags(p.group(1))) if p else ""
            chunks.append(t + " " + d)
    return " ".join(chunks)


class ProductBodyParser(HTMLParser):
    """Ignore shared navigation, controls and generic calls to action."""
    void = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.parts = [], []

    def handle_starttag(self, tag, attrs):
        classes = dict(attrs).get("class", "").split()
        skip = (bool(self.stack and self.stack[-1][1]) or
                tag in {"nav", "aside", "footer", "script", "style", "form", "button", "dialog", "template"} or
                any(c == "button" or re.search(r"(?:^|-)(?:sidebar|breadcrumbs?|cta|kicker|tabs)(?:-|$)", c) for c in classes))
        if tag not in self.void:
            self.stack.append((tag, skip))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.void:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if not self.stack or not self.stack[-1][1]:
            self.parts.append(data)


def extract_main_text(html: str, max_chars: int = 120000) -> str:
    """Plain text inside <main> (product body, specs, paragraphs). Excludes script/style."""
    m = re.search(r"<main\b[^>]*>([\s\S]*?)</main>", html, re.I)
    if not m:
        return ""
    body = m.group(1)
    body = re.sub(r"<script\b[\s\S]*?</script>", " ", body, flags=re.I)
    body = re.sub(r"<style\b[\s\S]*?</style>", " ", body, flags=re.I)
    body = re.sub(r"<!--[\s\S]*?-->", " ", body)
    parser = ProductBodyParser()
    parser.feed(body)
    text = norm_space(" ".join(parser.parts))
    if len(text) > max_chars:
        text = text[:max_chars]
    return text


def extract_data_codes(html: str) -> str:
    """Include short codes from data-code (e.g. RMU on catalog cards) in search text."""
    parts = []
    for code in re.findall(r'data-code="([^"]+)"', html, re.I):
        c = code.strip()
        if not c:
            continue
        parts.append(c.lower())
        cu = c.upper()
        if cu != c.lower():
            parts.append(cu)
    return norm_space(" ".join(parts))


def extract_products_hub_cards(html: str):
    out = []
    for m in re.finditer(r'<article class="products-card">([\s\S]*?)</article>', html):
        block = m.group(1)
        hm = re.search(r"<h4[^>]*>([\s\S]*?)</h4>", block, re.I)
        pm = re.search(r"</h4>\s*<p[^>]*>([\s\S]*?)</p>", block, re.I)
        am = re.search(
            r'<a class="button button-primary" href="(/products/[^"]+/)"',
            block,
            re.I,
        )
        if hm and am:
            text = norm_space(strip_tags(hm.group(1)))
            if pm:
                text += " " + norm_space(strip_tags(pm.group(1)))
            codes = extract_data_codes(block)
            if codes:
                text += " " + codes
            out.append((am.group(1), text))
    return out


CATEGORIES = {
    "metal-clad-switchgear": "mcs", "ring-main-unit": "rmu", "gas-insulated-switchgear": "gis",
    "neutral-earthing-resistors": "ner", "vacuum-circuit-breaker": "vcb", "load-break-switch": "lbs",
    "disconnector-switch": "dsw", "earthing-switch": "esw",
    "insulating-parts": "ip", "contact-and-copper-parts": "cc", "chassis-and-auxiliary-trucks": "ch",
    "shutters-and-interlocks": "si", "operating-mechanisms-and-coils": "om",
    "switchgear-accessories-and-controllers": "ia", "climate-control-and-lighting": "cl",
    "cable-connectors-and-accessories": "ca", "surge-arresters": "sa", "current-limiting-fuses": "clf",
    "drop-out-fuses": "dof", "indicators-and-detection-devices": "vsi",
    "integrated-control-and-condition-monitoring": "ic", "instrument-transformers": "ct",
}


def product_metadata(path, source, h1, main_text):
    """Use own rated-value rows, never withstand voltages or inferred equivalence."""
    slug = path.parent.name
    kind = "hub" if path == ROOT / "products/index.html" else "category" if slug in CATEGORIES else "product"
    category = CATEGORIES.get(slug, "")
    if not category and kind == "product":
        for prefix, family in [("gp-ner-", "ner"), ("gpn1-", "mcs"), ("gpn2-", "gis"), ("gpr", "rmu"), ("gpvn-", "vcb"),
                               ("zw", "vcb"), ("gpfn", "lbs"), ("gpwf", "lbs"), ("gpjn", "esw"), ("gn", "dsw")]:
            if slug.startswith(prefix):
                category = family
                break
    fields = []
    if kind == "product":
        for block in re.findall(r'<div class="product-hero-spec"[^>]*>([\s\S]*?)</div>', source, re.I):
            label = re.search(r"<strong[^>]*>([\s\S]*?)</strong>", block, re.I)
            value = re.search(r"<span[^>]*>([\s\S]*?)</span>", block, re.I)
            if label and value:
                fields.append((norm_space(strip_tags(label[1])).lower(), norm_space(strip_tags(value[1]))))
        for block in re.findall(r"<tr\b[^>]*>([\s\S]*?)</tr>", source, re.I):
            cells = re.findall(r"<(?:th|td)\b[^>]*>([\s\S]*?)</(?:th|td)>", block, re.I)
            if len(cells) >= 2:
                fields.append((norm_space(strip_tags(cells[0])).lower(), norm_space(strip_tags(" ".join(cells[1:])))))
    def numeric(values):
        numbers, ranges = set(), []
        for value in values:
            numbers.update(float(n) for n in re.findall(r"\d+(?:\.\d+)?", value))
            for lo, hi in re.findall(r"(\d+(?:\.\d+)?)\s*(?:~|–|—|-|\bto\b)\s*(\d+(?:\.\d+)?)", value, re.I):
                bounds = [float(lo), float(hi)]
                if bounds[0] <= bounds[1] and bounds not in ranges:
                    ranges.append(bounds)
        return sorted(numbers), ranges
    voltage_labels = {"rated voltage"}
    if category == "ner":
        voltage_labels.update({"system rated voltage", "rated system voltage", "system voltage"})
    volts, vranges = numeric([v for k, v in fields if k in voltage_labels])
    current_values = [v for k, v in fields if "rated current" in k and "short" not in k]
    if category == "ner":
        current_values.extend(amp + " A" for k, v in fields if k == "short-time current" for amp in re.findall(r"(\d+(?:\.\d+)?)\s*A\b", v, re.I))
    amps, aranges = numeric(current_values)
    if kind == "product" and not volts:
        volts = sorted({float(n) for n in re.findall(r"(\d+(?:\.\d+)?)\s*kv\b", h1, re.I)})
    models = re.findall(r"\b(?:GP[A-Z0-9.]+|ZW\d+[A-Z]?|GN\d+[A-Z]?)(?:[- ][\d.]+(?:\(\d+\))?(?:kV)?)*(?:\s*EK\d+)?", h1, re.I) if kind == "product" else []
    if kind == "product" and category == "ner":
        models = re.findall(r"\bGP-NER-\d+(?:\.\d+)?kV\b", h1, re.I)
    return {"kind": kind, "category": category, "models": models,
            "voltages": volts, "voltageRanges": vranges, "currents": amps, "currentRanges": aranges}


SITE_PAGES = [
    ("index.html", "/", "home", ["home", "homepage"]),
    ("about/index.html", "/about/", "company", ["about", "about us", "company", "company profile", "company introduction", "who we are"]),
    ("factory-quality/index.html", "/factory-quality/", "factory", ["factory", "manufacturing", "quality", "quality assurance", "inspection", "certification", "certificates"]),
    ("applications/index.html", "/applications/", "applications", ["application", "applications", "industries"]),
    ("projects/index.html", "/projects/", "projects", ["project", "projects", "references", "project references"]),
    ("downloads/index.html", "/downloads/", "downloads", ["catalog", "catalogue", "catalogs", "catalogues", "download", "downloads", "brochure"]),
    ("inquiry/index.html", "/inquiry/", "contact", ["contact", "contact us", "inquiry", "enquiry", "request a quote", "quotation", "email", "phone", "address"]),
]


def main() -> None:
    by_url: dict[str, dict] = {}
    metadata = {}

    def merge(url: str, title="", description="", extra=""):
        e = by_url.setdefault(
            url, {"url": url, "title": "", "description": "", "extra": []}
        )
        if title:
            e["title"] = title
        if description and not e["description"]:
            e["description"] = description
        if extra:
            e["extra"].append(extra)

    for path in product_source_paths():
        html = path.read_text(encoding="utf-8")
        url = clean_product_url(path)
        tm = re.search(r"<title>([^<]+)</title>", html, re.I)
        dm = re.search(
            r'<meta\s+name="description"\s+content="([^"]*)"', html, re.I
        )
        title = norm_space(strip_tags(tm.group(1))) if tm else url
        desc = unescape(dm.group(1).strip()) if dm else ""
        label = title.split("|")[0].strip()
        h1 = extract_h1(html)
        label = h1 or label
        cards = extract_card_snippets(html)
        main_text = extract_main_text(html)
        metadata[url] = product_metadata(path, html, h1, main_text)
        slug_words = path.stem.replace("-", " ")
        codes = extract_data_codes(html)
        extra = " ".join(x for x in (h1, cards, main_text, codes, slug_words) if x)
        merge(url, title=label, description=desc, extra=extra)

    products_path = ROOT / "products/index.html"
    if products_path.exists():
        ph = products_path.read_text(encoding="utf-8")
        for target, text in extract_products_hub_cards(ph):
            if target in by_url:
                merge(target, extra=text)

    # Only canonical public content is added. Redirects, privacy, search and
    # submission/success utilities stay outside the index; shared chrome is ignored.
    for relative, url, section, aliases in SITE_PAGES:
        source = (ROOT / relative).read_text(encoding="utf-8")
        tm = re.search(r"<title>([^<]+)</title>", source, re.I)
        dm = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', source, re.I)
        title = norm_space(strip_tags(tm[1])).split("|")[0].strip() if tm else extract_h1(source)
        description = unescape(dm[1].strip()) if dm else ""
        body = extract_main_text(source)
        merge(url, title=title, description=description, extra=body)
        metadata[url] = {"kind": "page", "siteSection": section, "aliases": aliases,
                         "category": "", "models": [], "voltages": [], "voltageRanges": [],
                         "currents": [], "currentRanges": []}

    out_list = []
    for url, e in sorted(by_url.items(), key=lambda x: x[0]):
        parts = [
            e["title"],
            e["description"],
            " ".join(e["extra"]),
            url.strip("/").replace("/", " ").replace("-", " "),
        ]
        search_text = norm_space(" ".join(parts)).lower()
        out_list.append(
            {
                "url": url,
                "title": e["title"],
                "description": e["description"],
                "searchText": search_text,
                **metadata[url],
            }
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out_list, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(out_list)} entries to {OUT.relative_to(ROOT)}")

    if PRODUCT_SEARCH_HTML.exists():
        compact = json.dumps(out_list, ensure_ascii=False, separators=(",", ":"))
        b64 = base64.standard_b64encode(compact.encode("utf-8")).decode("ascii")
        page = PRODUCT_SEARCH_HTML.read_text(encoding="utf-8")
        tpl_re = re.compile(
            r'(<template\s+id="gpswitch-product-search-index-b64"\s*>)([\s\S]*?)(</template>)',
            re.I,
        )
        m = tpl_re.search(page)
        if m:
            page = page[: m.start(2)] + b64 + page[m.end(2) :]
            PRODUCT_SEARCH_HTML.write_text(page, encoding="utf-8")
            print(f"Updated embedded index in {PRODUCT_SEARCH_HTML.name} ({len(b64)} base64 chars)")
        elif B64_MARKER in page:
            page = page.replace(B64_MARKER, b64, 1)
            PRODUCT_SEARCH_HTML.write_text(page, encoding="utf-8")
            print(f"Embedded index into {PRODUCT_SEARCH_HTML.name} ({len(b64)} base64 chars)")
        else:
            print("WARN: template #gpswitch-product-search-index-b64 not found in product-search.html")
    else:
        print("WARN: product-search.html not found")


if __name__ == "__main__":
    main()
