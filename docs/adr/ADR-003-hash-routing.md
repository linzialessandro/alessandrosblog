---
type: ADR
title: "ADR-003: Hash-Based Client-Side Routing"
description: Decision to use URL hash fragments (#post/slug, #tags=...) for client-side navigation instead of History API pushState paths.
tags: [adr, architecture, routing, spa]
timestamp: 2026-06-30T18:27:00Z
---

# ADR-003: Hash-Based Client-Side Routing

**Status:** Accepted  
**Date:** 2026

---

## Context

A single-page application needs a routing strategy to map URLs to views. Two main approaches exist for client-side routing:

| Approach | URL Example | Requirement |
|---|---|---|
| **History API** (`pushState`) | `/post/my-slug` | Server must return `index.html` for all paths |
| **Hash routing** | `/#post/my-slug` | No server configuration needed |

---

## Decision

Use **hash-based routing** with `window.location.hash` and `hashchange` events.

### URL Schema

| View | Hash |
|---|---|
| Homepage (no filter) | `` (empty) |
| Homepage (filtered) | `#tags=AI,Technology` |
| Post page | `#post/my-post-slug` |
| Privacy page | `#privacy` |

---

## Rationale

1. **Static hosting compatibility**: Hash-based routing works on any static file host (GitHub Pages, Cloudflare Pages, S3) without configuring URL rewrites or catch-all redirect rules.
2. **Zero server dependency**: The server only ever serves `index.html`. All routing logic lives in the browser.
3. **Simplicity**: `hashchange` events are well-supported and require no polyfills or libraries.
4. **Sitemap fallback**: For posts that are pre-rendered as static `.html` files, the sitemap correctly points to the clean `/posts/{slug}.html` URL. Hash routes are the fallback for dynamically-only-rendered posts.

---

## Consequences

- **Crawlability**: Hash URLs are traditionally not indexed by search crawlers. Modern crawlers (Google) do execute JS and can follow hash routes. The sitemap provides static URL hints as a supplement.
- **`pushState` for filter clearing**: One exception — when clearing all tag filters, `history.pushState` is used instead of `location.hash = ""` to avoid scrolling to the top of the page. `Router.route()` is then called manually since `pushState` does not trigger `hashchange`.
- **View Transitions**: `document.startViewTransition()` is called on every route change, providing smooth animated transitions. Falls back to immediate DOM update in unsupported browsers.
- **Shareable filter URLs**: Tag filter state is encoded directly in the hash (`#tags=AI,ML`), making filtered views bookmarkable and shareable. This state is also persisted to `localStorage` and restored on next visit.
