---
type: Concept
title: Glossary
description: Definitions for the core concepts in the Blog Website.
tags: [glossary, domain]
timestamp: 2026-07-30T23:45:00Z
---

# Glossary

- **Post**: A single distilled collection of thoughts or discoveries. It consists of a title, slug, summary, content (HTML), a publication date (`publishedAt`), and at least one tag. Guest posts also carry a contributor name and source URL.
- **Slug**: The URL-safe identifier for a Post. Lowercase letters, numbers, and hyphens only (e.g. `my-post-title`). Unique across all posts.
- **Tag**: A keyword used to categorize a Post. Tags drive the Filter system.
- **Archive**: The full list of all Posts displayed on the homepage, sortable by date and reducible by Filter.
- **Filter**: The active set of Tags used to reduce the visible Posts in the Archive. Persisted to `localStorage` and encoded in the URL hash (`#tags=AI,Technology`).
- **Contributor**: A guest author who has submitted a Post via the contributions workflow. Their name is appended to the post's HTML content.
- **Source**: An optional URL pointing to the original article or reference that inspired a Post. Required for guest contributions.
- **Static API**: Build-time split of `posts.json` into `api/index.json` (metadata for all posts) and `api/posts/{slug}.json` (full content per post) for lazy loading in the SPA.
- **Static Post Page**: Pre-rendered HTML at `posts/{slug}.html` for crawlers and social unfurlers. Includes meta tags, Article JSON-LD, and full body content; links into the SPA via `/#post/{slug}`.
- **BUILD_ID**: Short content hash of `posts.json` written to `assets/js/build-id.js` by the Static API builder. The SPA appends it as `?v=` on API fetches to bust browser/CDN caches after publishes.
- **Atom Feed**: Machine-readable subscription document at `feed.xml` (Atom), generated from recent Posts with static permalinks.
- **JSON-LD**: Schema.org structured data embedded as `<script type="application/ld+json">`. Static Post Pages use `Article`; the homepage uses `WebSite` + `Person`.
- **Publish Pipeline**: Ordered regeneration of Static API, Static Post Pages, Atom Feed, and sitemap (plus optional PDFs). Automated on `main` by GitHub Actions except PDFs, which remain local.
