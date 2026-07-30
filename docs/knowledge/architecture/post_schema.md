---
type: Concept
title: Post Data Schema
description: Documents the structure of a Post entry in posts.json, all fields, their constraints, and how each is consumed across the system.
resource: Website/posts.json
tags: [architecture, data, schema, posts]
timestamp: 2026-07-30T23:45:00Z
---

# Post Data Schema

`posts.json` is the single source of truth for all blog content. It contains one top-level `posts` array. Each element is a **Post** object, validated by `blogq` against `posts.schema.json`.

At build time the [Static Generators](../components/static_generators.md) produce:

- **Static API** — `api/index.json` (metadata) + `api/posts/{slug}.json` (full content) for SPA lazy loading
- **Static Post Pages** — `posts/{slug}.html` for crawlers and social cards
- **Atom Feed** / **sitemap** — distribution and indexing
- **BUILD_ID** — cache-bust token for SPA fetches

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
| `title` | `string` | ✅ Yes | Min length 1 | SPA renderer; static page `<title>` / OG; feed `<title>`; Article JSON-LD `headline` |
| `slug` | `string` | ✅ Yes | Pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$`, unique | SPA routing; filenames for API, static HTML, PDFs; feed/sitemap permalinks |
| `publishedAt` | `string` | ✅ Yes | ISO 8601 `date-time` format | Sort order; static page / feed dates; Article `datePublished` |
| `summary` | `string` | ✅ Yes | Max 600 chars | List cards; meta description; OG; feed summary; Article `description` |
| `tags` | `string[]` | ✅ Yes | Min 1 item, unique, no whitespace | Filters; related posts; static `article:tag`; feed categories |
| `content` | `string` | ✅ Yes | HTML string, min length 1 | SPA post body; static page body; feed HTML content; PDF via pandoc |
| `updatedAt` | `string` | ❌ Optional | ISO 8601 `date-time` format | SPA "Updated" label; sitemap `<lastmod>`; feed `<updated>`; Article `dateModified` |
| `source` | `string` | ❌ Optional | URL | Index metadata; required for guest posts |
| `contributor` | `string` | ❌ Optional | Free string | Index metadata; guest post footer |

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
