#!/usr/bin/env python3
"""Rebuild the product search index with directory-style public URLs."""

import base64
import json
import re
from pathlib import Path

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
    return [hub, *detail_pages]


def strip_tags(s: str) -> str:
    return re.sub(r"<[^>]+>", " ", s)


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


def extract_main_text(html: str, max_chars: int = 120000) -> str:
    """Plain text inside <main> (product body, specs, paragraphs). Excludes script/style."""
    m = re.search(r"<main\b[^>]*>([\s\S]*?)</main>", html, re.I)
    if not m:
        return ""
    body = m.group(1)
    body = re.sub(r"<script\b[\s\S]*?</script>", " ", body, flags=re.I)
    body = re.sub(r"<style\b[\s\S]*?</style>", " ", body, flags=re.I)
    body = re.sub(r"<!--[\s\S]*?-->", " ", body)
    text = norm_space(strip_tags(body))
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


def main() -> None:
    by_url: dict[str, dict] = {}

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
        desc = dm.group(1).strip() if dm else ""
        label = title.split("|")[0].strip()
        h1 = extract_h1(html)
        cards = extract_card_snippets(html)
        main_text = extract_main_text(html)
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
