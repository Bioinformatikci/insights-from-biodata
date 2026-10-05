# Insights From BioData

A static, single-page bioinformatics portfolio. The page presents research-support services, links to project repositories, and displays example RNA-seq and pathway figures. It includes an interactive project-brief builder, a deliverable explorer, and a gallery with larger image previews. The deliverable explorer shows illustrative examples; its files and checks are not measured project results or guaranteed outputs.

## View and preview

The GitHub Pages URL listed in this project is [bioinformatikci.github.io/insights-from-biodata](https://bioinformatikci.github.io/insights-from-biodata/). To preview the checked-out files locally, run from the repository root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. The site is plain HTML, CSS, and JavaScript; it does not require a build step or package installation.

## Repository contents

| Path | Purpose |
| --- | --- |
| `index.html` | Page structure, text, and links |
| `styles.css` | Responsive layout and visual styling |
| `script.js` | Navigation, project-brief builder, deliverable explorer, and image preview interactions |
| `assets/` | Example figures, favicon, and a sample PDF report |

The figures and PDF in `assets/` are portfolio examples. They do not provide the raw inputs or analysis code needed to reproduce the underlying scientific results. Follow the linked project repositories for their available methods and data notes.

## Checks

GitHub Actions runs a lightweight check on pushes and pull requests. It verifies local HTML and README file references, HTML fragment targets, and JavaScript syntax. Run the same checks locally with:

```bash
python3 scripts/check_local_links.py
node --check script.js
```

These checks catch broken local references and JavaScript parse errors. They do not test browser rendering, external links, accessibility, or scientific reproducibility.

## Contact and scope

Contact links are on the website. The page describes research support and does not offer clinical diagnosis, treatment decisions, or patient-specific medical interpretation.
