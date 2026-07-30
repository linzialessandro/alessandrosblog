---
type: Concept
title: Guest Contributions Workflow
description: Outlines the lifecycle of guest post submissions and the full publish pipeline after compilation.
resource: Website/submissions/
tags: [workflows, contributions, markdown, compilation]
timestamp: 2026-07-30T23:55:00Z
---

# Guest Contributions Workflow

Alessandro's Blog welcomes guest posts on AI, technology, and learning. To streamline contributions, we provide low-friction UI workflows alongside a traditional draft-based pipeline using Markdown files and an automated compiler.

## User-Facing Submission Workflows

Contributors can submit drafts via a convenient modal on the blog's homepage without manually interacting with the file system.

1. **Submit via Web (Recommended)**: Utilizes a parameterized GitHub URL to open the GitHub Web Editor directly in the `submissions/inbox/` directory. It pre-fills the editor with the required front-matter template. *Requires a free GitHub account.*
2. **Submit via Email**: Opens the contributor's native email client with a `mailto:` link pointing to `alessandro.linzi.phd@icloud.com`. The subject line and email body are automatically pre-filled with the front-matter template.

## Manual Submission Directory States

The guest post ingestion pipeline is segmented across directories under `/submissions/`:

1. `/submissions/inbox/`: New candidate drafts submitted by contributors.
2. `/submissions/accepted/`: Approved drafts placed here by maintainers, ready for compilation.
3. `/submissions/processed/`: Archival folder. The compiler automatically moves drafts here after successful integration into the database.
4. `/submissions/rejected/`: Drafts that were reviewed but declined. Moved here manually by maintainers.

---

## The Compilation Script (`compile-contrib-posts.js`)
- **Location**: `tools/compile-contrib-posts.js`
- **Purpose**: Automates ingestion, parsing frontmatter, translating Markdown to HTML, running safety checks, and appending standard attribution footers.

### Ingestion Flow:
1. **Reads Approved Drafts**: Inspects `/submissions/accepted/` for `.md` or `.txt` files.
2. **Parses Frontmatter**: Extracts metadata structured between `---` YAML boundaries.
   - *Required metadata*: `title`, `summary`, `contributor`, `source`.
   - *Optional metadata*: `slug` (auto-generated from title if omitted), `publishedAt` (defaults to current UTC timestamp if omitted).
   - `tags` is listed as optional in frontmatter, but the compiler **enforces at least 1 tag** — a draft without tags will be skipped with an error.
3. **Applies Validation Rules**:
   - Max summary length: 600 characters.
   - Slug check: Must be alphanumeric and hyphens only, lowercase, and unique.
   - Tag check: Requires at least one tag.
4. **HTML Transpiler (Markdown -> HTML)**:
   - Converts Markdown headers (`##`, `###`), lists (`-`), code snippets/fences (```), bold (`**`), and italics (`*`) to semantic HTML tags.
   - **Escapes Raw HTML**: Converts potential scripts and inline handlers (`on*`, `javascript:`) to safe strings to prevent XSS.
5. **Appends Attribution**: Attaches a standard contributor section at the bottom of the article.
6. **Commits and Moves**:
   - Prepends the new articles to the front of `posts.json`.
   - Moves the compiled draft files to `/submissions/processed/`.

## Running the Compiler

```bash
# Perform a dry-run check without updating files
node tools/compile-contrib-posts.js --dry-run

# Run compilation and update posts.json (automatically archives files)
node tools/compile-contrib-posts.js
```

## After compilation: full publish pipeline

> [!IMPORTANT]
> Compiling only updates `posts.json`. Regenerate **all** publish artifacts (or push to `main` and let CI do it).

```bash
blogq check posts.json

# 1. API JSON + BUILD_ID (+ patches index.html asset ?v=)
node scripts/build-static-api.js

# 2. Open Graph card images (requires Pillow)
python3 scripts/build-og-images.py

# 3. Static HTML for crawlers / social unfurlers
node scripts/build-static-pages.js

# 4. Atom feed + sitemap
node tools/generate-feed.js
node tools/generate-sitemap.js

# 5. Optional local PDFs
node scripts/build-pdfs.mjs

# 6. On-repo SEO surface check
node tools/check-seo.js
```

**CI:** On push to `main`, `.github/workflows/publish.yml` runs validation, API, OG images, static pages, feed, sitemap, SEO check, and (when enabled) PDFs, then commits artifacts with `[skip ci]`.

## Relevant Files
- [compile-contrib-posts.js](../../../tools/compile-contrib-posts.js)
- [Build Pipelines](build_pipelines.md)
- [SEO Strategy](seo.md)
