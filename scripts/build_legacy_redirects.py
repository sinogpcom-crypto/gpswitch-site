#!/usr/bin/env python3
"""Replace legacy root HTML pages with same-site clean-URL redirect stubs."""

from __future__ import annotations

import html
import json

from build_clean_url_pages import ROOT, ROUTES, SITE_ORIGIN


MARKER = "GPSWITCH_LEGACY_REDIRECT"


def clean_target_exists(clean_path: str) -> bool:
    if clean_path == "/":
        return (ROOT / "index.html").is_file()
    return (ROOT / clean_path.strip("/") / "index.html").is_file()


def redirect_document(clean_path: str) -> str:
    canonical = SITE_ORIGIN + clean_path
    escaped_path = html.escape(clean_path, quote=True)
    escaped_canonical = html.escape(canonical, quote=True)
    js_path = json.dumps(clean_path, ensure_ascii=False)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- {MARKER} -->
  <title>Page Moved | GreenPower Electric</title>
  <link rel="canonical" href="{escaped_canonical}">
  <meta http-equiv="refresh" content="0; url={escaped_path}">
  <script>window.location.replace({js_path});</script>
</head>
<body>
  <p>This page has moved to <a href="{escaped_path}">{escaped_canonical}</a>.</p>
</body>
</html>
"""


def main() -> None:
    legacy_routes = {
        source_name: clean_path
        for source_name, clean_path in ROUTES.items()
        if source_name != "index.html"
    }
    missing_targets = [
        clean_path
        for clean_path in legacy_routes.values()
        if not clean_target_exists(clean_path)
    ]
    if missing_targets:
        raise SystemExit(f"Missing clean targets: {missing_targets}")

    for source_name, clean_path in legacy_routes.items():
        (ROOT / source_name).write_text(
            redirect_document(clean_path), encoding="utf-8"
        )

    print(f"Built {len(legacy_routes)} legacy redirect pages.")


if __name__ == "__main__":
    main()
