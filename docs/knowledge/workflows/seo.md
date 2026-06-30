---
type: Concept
title: SEO Strategy
description: Documents how the blog manages search engine discoverability without a build system — dynamic meta tags, sitemap URL logic, robots.txt, and Cloudflare analytics.
resource: Website/tools/generate-sitemap.js
tags: [workflows, seo, metadata, sitemap]
timestamp: 2026-06-30T18:27:00Z
---

# SEO Strategy

Alessandro's Blog achieves full SEO coverage dynamically at runtime, without a static site generator or build-time HTML rendering. Every page update is client-side.

---

## Dynamic Meta Tag Management

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

The `<meta>` element is **created dynamically** if it doesn't already exist in the `<head>`:
```js
if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
}
```

> [!NOTE]
> Since meta tags are set by JavaScript, they may not be visible to crawlers that do not execute JS. Cloudflare and most modern search engine bots do execute JS for indexing. The sitemap provides a complementary signal for crawlers that do not.

---

## Sitemap URL Strategy

`tools/generate-sitemap.js` builds `sitemap.xml` with two URL strategies per post:

| Condition | URL Format | Priority |
|---|---|---|
| Static HTML file exists at `posts/{slug}.html` | `https://alessandrosblog.it.eu.org/posts/{slug}.html` | Preferred (clean URL) |
| No static file | `https://alessandrosblog.it.eu.org/#post/{slug}` | Fallback (hash route) |

**Fixed entries** always present:
- `/` — Homepage (daily change frequency)
- `/#privacy` — Privacy page

The `<lastmod>` tag uses `updatedAt` if present, otherwise falls back to `publishedAt`. `<priority>` and `<changefreq>` tags are omitted (Google ignores them per official guidance).

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

All crawlers are permitted to index the main site. Source code directories, submission drafts, and PDFs (which duplicate post content) are explicitly blocked to prevent duplicate content indexing.

---

## Analytics

This blog uses **Cloudflare Web Analytics** — a privacy-first analytics system that:
- Uses **no cookies**.
- Collects **no personal data**.
- Reports only aggregate traffic metrics (page views, referrers, device types).

This is disclosed in the Privacy page (`#privacy`).

---

## Recommended Post-Publish SEO Checklist

When a new post is published, run these commands to keep SEO signals current:

```bash
# 1. Rebuild API (required for the post to appear)
node scripts/build-static-api.js

# 2. Regenerate sitemap (updates <lastmod> timestamps)
node tools/generate-sitemap.js

# 3. Commit and push
git add . && git commit -m "content: publish 'Post Title'" && git push
```

## Relevant Files
- [generate-sitemap.js](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/tools/generate-sitemap.js)
- [robots.txt](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/robots.txt)
- [renderer.js](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/assets/js/renderer.js)
