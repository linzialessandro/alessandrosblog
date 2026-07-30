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
| `scripts/build-static-api.js` | `api/index.json`, `api/posts/{slug}.json`, `assets/js/build-id.js` | Lazy-load metadata/content for the SPA; content-hash **BUILD_ID** for cache busting |
| `scripts/build-static-pages.js` | `posts/{slug}.html` | Crawler- and unfurl-friendly self-contained HTML (title, OG tags, Article JSON-LD, full body) |
| `tools/generate-feed.js` | `feed.xml` | Atom feed (latest 20 posts, static permalinks, HTML content) |
| `tools/generate-sitemap.js` | `sitemap.xml` | Prefers clean `/posts/{slug}.html` URLs when files exist; otherwise hash routes |
| `scripts/build-pdfs.mjs` | `assets/pdfs/{slug}.pdf` | Optional local PDF typesetting (`pandoc` + `xelatex`); **not** run in CI |

## BUILD_ID

`build-static-api.js` hashes `posts.json` (SHA-256, 12 hex chars) into:

```js
// assets/js/build-id.js — auto-generated
export const BUILD_ID = "…";
```

`store.js` and `renderer.js` append `?v=${BUILD_ID}` to API (and static HTML fallback) fetches so deploys invalidate caches without `cache: "no-store"`.

## CI

`.github/workflows/publish.yml` runs validation + the non-PDF generators on push to `main` and commits dirty artifacts with `[skip ci]`. See [Infrastructure](../architecture/infrastructure.md).

## Relevant Files

- [build-static-api.js](../../../scripts/build-static-api.js)
- [build-static-pages.js](../../../scripts/build-static-pages.js)
- [generate-feed.js](../../../tools/generate-feed.js)
- [generate-sitemap.js](../../../tools/generate-sitemap.js)
- [build-pdfs.mjs](../../../scripts/build-pdfs.mjs)
