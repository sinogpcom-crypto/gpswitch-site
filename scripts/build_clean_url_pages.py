#!/usr/bin/env python3
"""Build directory-style pages and a clean-URL sitemap from root HTML sources."""

from __future__ import annotations

import hashlib
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITE_ORIGIN = "https://gpswitch.com"
LEGACY_REDIRECT_MARKER = "GPSWITCH_LEGACY_REDIRECT"


def build_route_map() -> dict[str, str]:
    routes = {
        "index.html": "/",
        "about-greenpower.html": "/about/",
        "applications.html": "/applications/",
        "downloads.html": "/downloads/",
        "factory-quality.html": "/factory-quality/",
        "inquiry.html": "/inquiry/",
        "inquiry-success.html": "/inquiry-success/",
        "product-search.html": "/search/",
        "products.html": "/products/",
        "projects-references.html": "/projects/",
    }
    for path in sorted(ROOT.glob("products-*.html")):
        slug = path.stem.removeprefix("products-")
        routes[path.name] = f"/products/{slug}/"
    return routes


ROUTES = build_route_map()
SKIP_PREFIXES = (
    "#",
    "?",
    "//",
    "http:",
    "https:",
    "mailto:",
    "tel:",
    "data:",
    "javascript:",
    "blob:",
)
URL_ATTRIBUTE_RE = re.compile(
    r"(?P<prefix>\b(?:href|src|action|poster|data-target-url|data-catalog-file)\s*=\s*)"
    r"(?P<quote>[\"'])(?P<url>.*?)(?P=quote)",
    re.I,
)
SRCSET_RE = re.compile(
    r"(?P<prefix>\bsrcset\s*=\s*)(?P<quote>[\"'])(?P<value>.*?)(?P=quote)",
    re.I,
)
CSS_URL_RE = re.compile(r"url\(\s*(?P<quote>[\"']?)(?P<url>[^\"')]+)(?P=quote)\s*\)", re.I)
QUOTED_LOCAL_FILE_RE = re.compile(
    r"(?P<quote>[\"'])(?P<url>(?:(?:\.\.?/)+)?[^\"']+\.(?:html|json|pdf)(?:[?#][^\"']*)?)(?P=quote)",
    re.I,
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def split_suffix(value: str) -> tuple[str, str]:
    match = re.search(r"[?#]", value)
    if not match:
        return value, ""
    return value[: match.start()], value[match.start() :]


def clean_local_url(value: str) -> str:
    value = value.strip()
    if not value or value.lower().startswith(SKIP_PREFIXES):
        return value

    path_part, suffix = split_suffix(value)
    normalized = re.sub(r"^(?:\.\.?/)+", "", path_part.replace("\\", "/"))
    normalized = normalized.lstrip("/")
    if normalized in ROUTES:
        return ROUTES[normalized] + suffix
    return "/" + normalized + suffix


def replace_url_attribute(match: re.Match[str]) -> str:
    return (
        match.group("prefix")
        + match.group("quote")
        + clean_local_url(match.group("url"))
        + match.group("quote")
    )


def replace_srcset(match: re.Match[str]) -> str:
    converted = []
    for candidate in match.group("value").split(","):
        parts = candidate.strip().split(None, 1)
        if not parts:
            continue
        url = clean_local_url(parts[0])
        converted.append(url + ((" " + parts[1]) if len(parts) > 1 else ""))
    return match.group("prefix") + match.group("quote") + ", ".join(converted) + match.group("quote")


def replace_css_url(match: re.Match[str]) -> str:
    quote = match.group("quote")
    return f"url({quote}{clean_local_url(match.group('url'))}{quote})"


def replace_quoted_local_file(match: re.Match[str]) -> str:
    quote = match.group("quote")
    return quote + clean_local_url(match.group("url")) + quote


def transform_page(source_name: str, clean_path: str) -> str:
    source = ROOT / source_name
    html = source.read_text(encoding="utf-8")
    html = URL_ATTRIBUTE_RE.sub(replace_url_attribute, html)
    html = SRCSET_RE.sub(replace_srcset, html)
    html = CSS_URL_RE.sub(replace_css_url, html)
    html = QUOTED_LOCAL_FILE_RE.sub(replace_quoted_local_file, html)

    if source_name == "inquiry.html":
        html = html.replace('name="source_page" value="inquiry.html"', 'name="source_page" value="/inquiry/"')

    canonical = SITE_ORIGIN + clean_path
    html, canonical_count = re.subn(
        r'(<link\s+rel="canonical"\s+href=")[^"]+("\s*/?>)',
        rf"\g<1>{canonical}\g<2>",
        html,
        count=1,
        flags=re.I,
    )
    if canonical_count != 1:
        raise RuntimeError(f"Expected one canonical in {source_name}, found {canonical_count}")

    if clean_path in {"/search/", "/inquiry-success/"} and not re.search(
        r'<meta\s+name="robots"', html, re.I
    ):
        canonical_tag = f'<link rel="canonical" href="{canonical}">'
        html = html.replace(
            canonical_tag,
            '<meta name="robots" content="noindex, follow">\n  ' + canonical_tag,
            1,
        )

    return html


def target_for(clean_path: str) -> Path:
    if clean_path == "/":
        return ROOT / "index.html"
    return ROOT / clean_path.strip("/") / "index.html"


def build_sitemap() -> None:
    excluded = {"/search/", "/inquiry-success/"}
    paths = [route for route in ROUTES.values() if route not in excluded]
    paths = sorted(set(paths), key=lambda value: (value != "/", value))
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for clean_path in paths:
        priority = "1.0" if clean_path == "/" else "0.8"
        lines.extend(
            [
                "  <url>",
                f"    <loc>{SITE_ORIGIN}{clean_path}</loc>",
                "    <lastmod>2026-09-01</lastmod>",
                f"    <priority>{priority}</priority>",
                "  </url>",
            ]
        )
    lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    root_sources = [ROOT / name for name in ROUTES]
    redirected_sources = [
        path.name
        for path in root_sources
        if path.name != "index.html"
        and LEGACY_REDIRECT_MARKER in path.read_text(encoding="utf-8")
    ]
    if redirected_sources:
        raise SystemExit(
            "Clean pages are already active and legacy source files are redirects; "
            "refusing to overwrite clean pages from redirect stubs."
        )
    before_hashes = {path.name: sha256(path) for path in root_sources}

    for source_name, clean_path in ROUTES.items():
        target = target_for(clean_path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(transform_page(source_name, clean_path), encoding="utf-8")

    build_sitemap()

    changed_sources = [
        path.name
        for path in root_sources
        if path.name != "index.html" and sha256(path) != before_hashes[path.name]
    ]
    print(f"Built {len(ROUTES)} clean pages ({len(ROUTES) - 1} directory index files plus the homepage).")
    print(f"Changed legacy source pages (excluding homepage): {changed_sources}")
    print(f"Sitemap URLs: {len(set(ROUTES.values()) - {'/search/', '/inquiry-success/'})}")


if __name__ == "__main__":
    main()
