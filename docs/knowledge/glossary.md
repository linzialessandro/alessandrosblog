---
type: Concept
title: Glossary
description: Definitions for the core concepts in the Blog Website.
tags: [glossary, domain]
timestamp: 2026-06-30T14:17:00Z
---

# Glossary

- **Post**: A single distilled collection of thoughts or discoveries. It consists of a title, slug, summary, content (HTML), a publication date (`publishedAt`), and at least one tag. Guest posts also carry a contributor name and source URL.
- **Slug**: The URL-safe identifier for a Post. Lowercase letters, numbers, and hyphens only (e.g. `my-post-title`). Unique across all posts.
- **Tag**: A keyword used to categorize a Post. Tags drive the Filter system.
- **Archive**: The full list of all Posts displayed on the homepage, sortable by date and reducible by Filter.
- **Filter**: The active set of Tags used to reduce the visible Posts in the Archive. Persisted to `localStorage` and encoded in the URL hash (`#tags=AI,Technology`).
- **Contributor**: A guest author who has submitted a Post via the contributions workflow. Their name is appended to the post's HTML content.
- **Source**: An optional URL pointing to the original article or reference that inspired a Post. Required for guest contributions.
