---
type: Concept
title: SEO Strategy
description: Documents search discoverability — static pre-rendered posts, JSON-LD, Atom feed, sitemap URL logic, robots.txt, and privacy-first analytics.
resource: Website/scripts/build-static-pages.js
tags: [workflows, seo, metadata, sitemap, feed, json-ld]
timestamp: 2026-07-30T23:30:00Z
---

# SEO Strategy

Alessandro's Blog is indexable through **static pre-rendered HTML** for every post, plus a crawlable homepage, sitemap, Atom feed, and structured data. The SPA remains the interactive reading experience; static pages exist for crawlers, social unfurlers, and readers without JavaScript.

---

## Static Pre-Rendered Posts (primary crawl surface)

`scripts/build-static-pages.js` generates `posts/{slug}.html` for every entry in `posts.json`.

Each static page includes:

| Signal | Purpose |
|---|---|
| `<title>` + meta description | SERP snippet basics |
| Canonical URL | `https://alessandrosblog.it.eu.org/posts/{slug}.html` |
| Open Graph + Twitter Card tags | Social previews (text-only; no auto `og:image` yet) |
| Article meta (`published_time`, tags) | Article unfurlers |
| JSON-LD `Article` | Rich-result eligibility |
| Full HTML body | Readable without JS |

Static pages link back into the SPA via `/#post/{slug}` for the interactive experience.

---

## Homepage Metadata & Structured Data

`index.html` ships crawler-visible homepage signals (not only JS-injected tags):

- Meta description and canonical URL
- Atom feed discovery: `<link rel="alternate" type="application/atom+xml" href="feed.xml">`
- Open Graph / Twitter homepage tags including `og:image` (`assets/og/default.png`)
- JSON-LD `@graph` with `WebSite` + `Person` + `SearchAction` (Google `site:` search template — no on-site search UI)

The SPA `Renderer` still updates `<title>` / description on client-side route changes for in-app navigation.

---

## Dynamic Meta Tag Management (SPA)

The `Renderer` class in `renderer.js` updates `<title>` and `<meta name="description">` on every route change.

### Homepage
```js
document.title = "Alessandro's blog — Publicly collecting what I learn";
metaDesc.content = "A distilled collection of things I discovered...";
```

### Post Page
```js
document.title = `${post.title} — Alessandro's blog`;
metaDesc.content = post.summary || "";
```

> [!NOTE]
> Rely on static `posts/{slug}.html` for crawlers that do not execute JS. SPA meta updates are for interactive navigation and progressive enhancement.

---

## Atom Feed

`tools/generate-feed.js` writes `feed.xml` (Atom) with the latest 20 posts:

- Title, summary, published/updated dates
- Feed-level author
- Permalink to the static HTML URL when available
- Full HTML content in CDATA (loaded from `api/posts/{slug}.json`)

Discoverability: homepage `<link rel="alternate" type="application/atom+xml">`.

---

## Sitemap URL Strategy

`tools/generate-sitemap.js` builds `sitemap.xml` with two URL strategies per post:

| Condition | URL Format |
|---|---|
| Static HTML file exists at `posts/{slug}.html` | `https://alessandrosblog.it.eu.org/posts/{slug}.html` |
| No static file | `https://alessandrosblog.it.eu.org/#post/{slug}` |

**Fixed entries** always present:

- `/` — Homepage
- `/#privacy` — Privacy page

`<lastmod>` uses `updatedAt` if present, otherwise `publishedAt`. `<priority>` and `<changefreq>` are omitted (Google ignores them).

**Order:** run `build-static-pages.js` **before** `generate-sitemap.js` so clean URLs are preferred.

---

## robots.txt Policy

```
User-agent: *
Allow: /

Disallow: /tools/
Disallow: /scripts/
Disallow: /submissions/
Disallow: /.git/
Disallow: /.venv/
Disallow: /.pdf-temp/
Disallow: /pdfs/
Disallow: /README.md
Disallow: /LICENSE
Disallow: /.gitignore

Sitemap: https://alessandrosblog.it.eu.org/sitemap.xml
```

All crawlers may index the main site. Source directories, submission drafts, and PDFs (which duplicate post content) are blocked to reduce duplicate-content noise.

---

## Analytics

This blog uses **Cloudflare Web Analytics** — a privacy-first analytics system that:

- Uses **no cookies**.
- Collects **no personal data**.
- Reports only aggregate traffic metrics (page views, referrers, device types).

This is disclosed in the Privacy page (`#privacy`).

---

## Open Graph images

`scripts/build-og-images.py` writes `assets/og/{slug}.png` (1200×630) plus `assets/og/default.png` for the homepage. Static pages and the homepage set `og:image` / `twitter:image` to those URLs. Article JSON-LD includes the same image.

Requires **Pillow** (`pip install pillow`).

## Recommended Post-Publish SEO Checklist

### A. Regenerate artifacts (or let CI do it on push to `main`)

```bash
blogq check posts.json
node scripts/build-static-api.js
python3 scripts/build-og-images.py
node scripts/build-static-pages.js
node tools/generate-feed.js
node tools/generate-sitemap.js
node tools/check-seo.js
# optional: node scripts/build-pdfs.mjs
git add . && git commit -m "content: publish 'Post Title'" && git push
```

### B. Harvest indexing (manual — once per property, then as needed)

Code can only prepare the surface. Actual ranking requires:

1. Open [Google Search Console](https://search.google.com/search-console) → add property `https://alessandrosblog.it.eu.org/`
2. Verify ownership (DNS TXT at the registrar, or HTML file method)
3. **Sitemaps** → submit `https://alessandrosblog.it.eu.org/sitemap.xml`
4. **URL Inspection** on a few `posts/{slug}.html` pages → Request indexing
5. Optionally share a post URL in Slack/iMessage and confirm the OG card shows the branded image

`node tools/check-seo.js` validates the on-repo surface (static HTML, OG files, sitemap, feed, JSON-LD) but cannot submit to Google for you.

GitHub Actions `.github/workflows/publish.yml` runs validation, API, OG images, static pages, feed, sitemap, and SEO check on push to `main`. A separate job builds PDFs (pandoc + TeX Live).

## Relevant Files

- [build-static-pages.js](../../../scripts/build-static-pages.js)
- [build-og-images.py](../../../scripts/build-og-images.py)
- [check-seo.js](../../../tools/check-seo.js)
- [generate-feed.js](../../../tools/generate-feed.js)
- [generate-sitemap.js](../../../tools/generate-sitemap.js)
- [robots.txt](../../../robots.txt)
- [renderer.js](../../../assets/js/renderer.js)
- [publish.yml](../../../.github/workflows/publish.yml)
- [Static Generators](../components/static_generators.md)
