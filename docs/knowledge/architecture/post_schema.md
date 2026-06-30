---
type: Concept
title: Post Data Schema
description: Documents the structure of a Post entry in posts.json, all fields, their constraints, and how each is consumed across the system.
resource: Website/posts.json
tags: [architecture, data, schema, posts]
timestamp: 2026-06-30T18:27:00Z
---

# Post Data Schema

`posts.json` is the single source of truth for all blog content. It contains one top-level `posts` array. Each element is a **Post** object, validated by `blogq` against `posts.schema.json`.

The database is split by the Static API Builder at build time into `api/index.json` (metadata only) and individual `api/posts/{slug}.json` files (full content), allowing lazy loading.

---

## Full Post Object

```json
{
  "title":       "My Post Title",
  "slug":        "my-post-title",
  "publishedAt": "2026-01-15T10:00:00Z",
  "updatedAt":   "2026-02-01T12:00:00Z",
  "summary":     "A short description (max 600 chars).",
  "tags":        ["AI", "Technology"],
  "content":     "<p>HTML content of the post...</p>",
  "source":      "https://example.com/original-article",
  "contributor": "Contributor Name"
}
```

---

## Field Reference

| Field | Type | Required | Constraints | Consumer(s) |
|---|---|---|---|---|
| `title` | `string` | ✅ Yes | Min length 1 | `renderer.js` (post header, list card, `<title>` tag, related posts, nav) |
| `slug` | `string` | ✅ Yes | Pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$`, unique | `store.js` (`getPost`), `router.js` (hash navigation), `build-static-api.js` (filename), `build-pdfs.mjs` (PDF filename), `renderer.js` (href links) |
| `publishedAt` | `string` | ✅ Yes | ISO 8601 `date-time` format | `store.js` (sort order), `renderer.js` (formatted date display), `build-pdfs.mjs` (sort order) |
| `summary` | `string` | ✅ Yes | Max 600 chars | `renderer.js` (post card subtitle, `<meta name="description">`) |
| `tags` | `string[]` | ✅ Yes | Min 1 item, unique, no whitespace | `store.js` (`allTags` set, filter logic, `getRelatedPosts` scoring), `renderer.js` (tag chips, filter popover) |
| `content` | `string` | ✅ Yes | HTML string, min length 1 | `renderer.js` (`renderPostPage` injects via `innerHTML`), `build-pdfs.mjs` (HTML → LaTeX via pandoc) |
| `updatedAt` | `string` | ❌ Optional | ISO 8601 `date-time` format | `renderer.js` (shows "Updated" label on post page), `generate-sitemap.js` (`<lastmod>`) |
| `source` | `string` | ❌ Optional | URL | `build-static-api.js` (included in index metadata), `compile-contrib-posts.js` (required for guest posts) |
| `contributor` | `string` | ❌ Optional | Free string | `build-static-api.js` (included in index), `compile-contrib-posts.js` (required for guest posts, appended to HTML footer) |

---

## Data Flow Diagram

```mermaid
graph LR
    A[posts.json] -->|build-static-api.js| B[api/index.json]
    A -->|build-static-api.js| C[api/posts/{slug}.json]
    B -->|fetch on load| D[BlogStore.posts array]
    C -->|fetch on demand| E[renderer.renderPostPage]
    D --> F[Homepage archive list]
    D --> G[Tag filter & chips]
    D --> H[Related posts scoring]
    A -->|build-pdfs.mjs| I[assets/pdfs/{slug}.pdf]
    A -->|generate-sitemap.js| J[sitemap.xml]
```

---

## Key Notes for Agents

- **Field casing variant**: `store.js` handles both `publishedAt` and `publishedat` (lowercase) for backward compatibility via `_pub(p)` helper.
- **Content security**: `renderer.js` uses `this.esc()` (DOM-based escaping) for all metadata fields. The `content` field is trusted HTML — it is injected verbatim via `innerHTML`. `blogq` validates that no `<script>` or `on*` handlers are present.
- **Lazy loading**: The `content` field is **not** included in `api/index.json`. It is only fetched when a user navigates to the full post page.
- **Guest posts**: The `compile-contrib-posts.js` tool requires `source` and `contributor` fields for guest submissions, even though they are technically optional in the core schema.

## Relevant Files
- [posts.schema.json](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/tools/blogq/src/blogq/schema/posts.schema.json)
- [store.js](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/assets/js/store.js)
- [build-static-api.js](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/scripts/build-static-api.js)
