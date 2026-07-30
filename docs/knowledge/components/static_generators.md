---
type: Concept
title: Static Generators
description: Node utilities that turn posts.json into the static API, pre-rendered HTML pages, Atom feed, sitemap, and BUILD_ID cache token.
resource: Website/scripts/
tags: [components, build, seo, feed, sitemap]
timestamp: 2026-07-30T23:45:00Z
---

# Static Generators

Small Node.js scripts (no npm dependencies) materialize publish artifacts from `posts.json`. Full command order and CI behavior live in [Build Pipelines](../workflows/build_pipelines.md).

| Script | Output | Role |
|---|---|---|
| `scripts/build-static-api.js` | `api/*`, `assets/js/build-id.js`, patches `index.html` `?v=` | Lazy-load API + SPA/CSS cache bust |
| `scripts/build-og-images.py` | `assets/og/{slug}.png`, `default.png` | Branded 1200×630 social cards (Pillow) |
| `scripts/build-static-pages.js` | `posts/{slug}.html` | Design-system static HTML + OG image meta + Article JSON-LD + Prism |
| `tools/generate-feed.js` | `feed.xml` | Atom feed (latest 20 posts) |
| `tools/generate-sitemap.js` | `sitemap.xml` | Prefers `/posts/{slug}.html` when present |
| `tools/check-seo.js` | exit status + diagnostics | On-repo SEO surface validator |
| `scripts/build-pdfs.mjs` | `assets/pdfs/{slug}.pdf` | PDF typesetting (`pandoc` + `xelatex`); also in CI |

## BUILD_ID

`build-static-api.js` hashes `posts.json` (SHA-256, 12 hex chars) into:

```js
// assets/js/build-id.js — auto-generated
export const BUILD_ID = "…";
```

- SPA API fetches: `?v=${BUILD_ID}`
- SPA shell assets: `style.css?v=` and `main.js?v=` rewritten in `index.html`

## CI

`.github/workflows/publish.yml`: lightweight `publish` job + heavy `pdfs` job. See [Infrastructure](../architecture/infrastructure.md).

## Relevant Files

- [build-static-api.js](../../../scripts/build-static-api.js)
- [build-og-images.py](../../../scripts/build-og-images.py)
- [build-static-pages.js](../../../scripts/build-static-pages.js)
- [check-seo.js](../../../tools/check-seo.js)
- [generate-feed.js](../../../tools/generate-feed.js)
- [generate-sitemap.js](../../../tools/generate-sitemap.js)
- [build-pdfs.mjs](../../../scripts/build-pdfs.mjs)
