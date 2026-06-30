---
type: ADR
title: "ADR-002: Static API Split Pattern"
description: Decision to split posts.json into a lightweight metadata index and individual lazy-loaded post files at build time.
tags: [adr, architecture, performance, api]
timestamp: 2026-06-30T18:27:00Z
---

# ADR-002: Static API Split Pattern

**Status:** Accepted  
**Date:** 2026

---

## Context

`posts.json` is the single source of truth for all blog content, including full HTML bodies. As the number of posts grows, loading the complete file on every page visit becomes expensive. A blog with 100 posts, each with 2,000 words of HTML, would result in a several-megabyte initial payload.

### Options Considered

| Option | Pros | Cons |
|---|---|---|
| Load `posts.json` in full on startup | Simple, one request | Payload grows unbounded with each post |
| Server-side API with dynamic queries | Infinitely scalable | Requires a server — violates the static-only constraint |
| **Static API split (chosen)** | Static files, lazy-loaded, CDN-cacheable | Requires a build step (`build-static-api.js`) |

---

## Decision

At build time, `scripts/build-static-api.js` splits `posts.json` into:

1. **`api/index.json`**: A lightweight metadata array (`title`, `slug`, `publishedAt`, `summary`, `tags`, `source`, `contributor`). Loaded on startup. Does **not** include `content`.
2. **`api/posts/{slug}.json`**: One file per post containing the complete post object including full `content`. Fetched on demand when the user navigates to a post.

---

## Rationale

1. **Bounded startup cost**: Initial load is proportional to the number of posts × metadata size (small), not content size.
2. **CDN caching**: Individual post files are immutable once published and can be cached aggressively at the CDN edge.
3. **No server required**: All files are static JSON — deployable on GitHub Pages, S3, Cloudflare Pages, or any CDN.
4. **Simple build script**: The split is a 57-line Node.js script with zero dependencies.

---

## Consequences

- A build step (`node scripts/build-static-api.js`) **must** be run whenever `posts.json` changes. Agents and contributors must include this step in the publish workflow.
- The `content` field is absent from `api/index.json`. Code that needs post content must fetch from `api/posts/{slug}.json`. `BlogStore` caches the fetched content on the post object in memory (`post.content = content`).
- If `api/posts/{slug}.json` is missing (build not run), `renderer.js` falls back to fetching `posts/{slug}.html` for backward compatibility.
