#!/usr/bin/env python3
"""Check local references used by the site pages and README."""

from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]


class PageReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.references = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get("id"):
            self.ids.add(values["id"])
        for name in ("href", "src", "data-image"):
            if values.get(name):
                self.references.append((tag, name, values[name]))


PAGES = ["index.html", *(f"{name}/index.html" for name in ("services", "portfolio", "resources", "process", "about"))]
parsed_pages = {}
for name in PAGES:
    parsed_pages[ROOT / name] = PageReferences()
    parsed_pages[ROOT / name].feed((ROOT / name).read_text(encoding="utf-8"))

errors = []
checked = 0


def check(source, base, label, value):
    global checked
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc:
        return
    if parsed.path.startswith("/"):
        errors.append(f"{source} {label}: root-relative URL is not checked: {value}")
        return
    target = (base.parent / unquote(parsed.path)).resolve() if parsed.path else base
    if target.is_dir():
        target = target / "index.html"
    if not target.is_relative_to(ROOT) or not target.is_file():
        errors.append(f"{source} {label}: missing or escaped local file: {value}")
        return
    if parsed.fragment and parsed.fragment != "top" and target in parsed_pages:
        if parsed.fragment not in parsed_pages[target].ids:
            errors.append(f"{source} {label}: missing page anchor: {value}")
            return
    checked += 1


for base, page in parsed_pages.items():
    source = base.relative_to(ROOT)
    for tag, name, value in page.references:
        check(source, base, f"{tag} {name}", value)

readme = (ROOT / "README.md").read_text(encoding="utf-8")
for link in re.findall(r"!?\[[^\]]*\]\(([^)]+)\)", readme):
    check("README.md", ROOT / "README.md", "link", link)

if errors:
    raise SystemExit("\n".join(errors))
print(f"Checked {checked} local files and page anchors.")
