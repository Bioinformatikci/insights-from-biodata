#!/usr/bin/env python3
"""Check local references used by the static page and README."""

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


page = PageReferences()
page.feed((ROOT / "index.html").read_text(encoding="utf-8"))
readme = (ROOT / "README.md").read_text(encoding="utf-8")
readme_links = re.findall(r"!?\[[^\]]*\]\(([^)]+)\)", readme)

errors = []
checked = 0
for source, name, value in [*page.references, *(("README.md", "link", link) for link in readme_links)]:
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc:
        continue
    if parsed.path.startswith("/"):
        errors.append(f"{source} {name}: root-relative URL is not checked: {value}")
        continue
    if not parsed.path:
        if parsed.fragment and parsed.fragment not in page.ids:
            errors.append(f"{source} {name}: missing page anchor: {value}")
        continue
    target = (ROOT / unquote(parsed.path)).resolve()
    if not target.is_relative_to(ROOT) or not target.is_file():
        errors.append(f"{source} {name}: missing or escaped local file: {value}")
    else:
        checked += 1

if errors:
    raise SystemExit("\n".join(errors))
print(f"Checked {checked} local files and page anchors.")
