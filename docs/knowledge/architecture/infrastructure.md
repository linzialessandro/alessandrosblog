---
type: Concept
title: Infrastructure & Dependencies
description: Documents the hosting setup, DNS, dependency management, external tool requirements, and the deliberate absence of a CI/CD pipeline.
resource: Website/.github/dependabot.yml
tags: [architecture, infrastructure, hosting, dependencies, devops]
timestamp: 2026-06-30T18:27:00Z
---

# Infrastructure & Dependencies

Alessandro's Blog is deliberately infrastructure-light. It is a static site that runs entirely from a CDN with no application servers, no databases, and no CI/CD pipeline.

---

## Hosting & DNS

| Layer | Provider | Notes |
|---|---|---|
| **Domain** | [EU.org / nic.eu.org](https://nic.eu.org) | Free, community-run domain registry operating since 1996. Aligns with the blog's open-web philosophy. TLD: `it.eu.org` |
| **Live URL** | `https://alessandrosblog.it.eu.org` | Primary public URL |
| **CDN / Proxy** | Cloudflare | Handles TLS, DDoS protection, caching, and privacy-friendly aggregate analytics (no cookies, no personal tracking) |
| **Origin** | GitHub Pages or equivalent static host | Serves the static files (`index.html`, `api/`, `assets/`) |

---

## External Tool Dependencies

These tools must be installed on the host system to run the build scripts. They are **not** managed by a Node or Python package manager.

| Tool | Version | Required By | Installation |
|---|---|---|---|
| `pandoc` | Any recent | `build-pdfs.mjs` | `brew install pandoc` / OS package manager |
| `xelatex` | TeX Live / MacTeX | `build-pdfs.mjs` | `brew install --cask mactex` |
| `Node.js` | LTS (≥18) | `build-static-api.js`, `generate-sitemap.js`, `compile-contrib-posts.js` | [nodejs.org](https://nodejs.org) |
| `Python` | ≥ 3.11 | `blogq` | Bundled with macOS or [python.org](https://python.org) |

> [!NOTE]
> PDF generation requires both `pandoc` (HTML → LaTeX conversion) and `xelatex` (LaTeX → PDF). If either is missing, `build-pdfs.mjs` will fail with an exec error for that post.

---

## Python Package Dependencies (`tools/blogq/`)

Managed via `pyproject.toml` using `setuptools`. The only runtime dependency is:

- `jsonschema >= 4.25` — used in `validate.py` for JSON Schema Draft 2020-12 validation.

Install with:
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e tools/blogq
```

---

## Automated Dependency Monitoring (Dependabot)

A Dependabot configuration at `.github/dependabot.yml` automatically monitors the `blogq` Python package for security updates:

```yaml
- package-ecosystem: "pip"
  directory: "/tools/blogq"
  schedule:
    interval: "weekly"
```

Node.js scripts have **no `package.json`** and therefore no npm dependency tracking — they use only Node built-ins (`fs`, `path`, `child_process`).

---

## Deliberate Absence of CI/CD

There is no CI/CD pipeline (no GitHub Actions, no automated deploy on push). This is an intentional architectural decision documented in [ADR-001](../../adr/ADR-001-no-framework.md).

**Manual workflow for a new post:**
1. Add entry to `posts.json`.
2. Run `blogq check posts.json` to validate.
3. Run `node scripts/build-static-api.js` to rebuild API files.
4. Optionally run `node scripts/build-pdfs.mjs` for PDF generation.
5. Optionally run `node tools/generate-sitemap.js` to update `sitemap.xml`.
6. Commit and push to the origin.

---

## SEO & Crawling

The `robots.txt` at the repo root allows all crawlers but blocks source code and internal directories to avoid indexing noise:

```
User-agent: *
Allow: /

# Block tools and source code directories
Disallow: /tools/
Disallow: /scripts/
Disallow: /submissions/
Disallow: /.git/
Disallow: /.venv/
Disallow: /.pdf-temp/

# Block duplicate content (PDFs are mirrors of posts)
Disallow: /pdfs/

# Block repository metadata files
Disallow: /README.md
Disallow: /LICENSE
Disallow: /.gitignore

Sitemap: https://alessandrosblog.it.eu.org/sitemap.xml
```

See [SEO Strategy](../workflows/seo.md) for full details.

## Relevant Files
- [.github/dependabot.yml](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/.github/dependabot.yml)
- [tools/blogq/pyproject.toml](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/tools/blogq/pyproject.toml)
- [robots.txt](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/robots.txt)
