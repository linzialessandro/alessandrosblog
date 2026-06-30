---
type: Concept
title: Guest Contributions Workflow
description: Outlines the lifecycle of guest post submissions and the contributor draft compilation script.
resource: Website/submissions/
tags: [workflows, contributions, markdown, compilation]
timestamp: 2026-06-30T18:23:00Z
---

# Guest Contributions Workflow

Alessandro's Blog welcomes guest posts on AI, technology, and learning. To streamline contributions, we enforce a draft-based pipeline using Markdown files and an automated compiler.

## Submission Directory States

The guest post ingestion pipeline is segmented across three directories under `/submissions/`:

1. `/submissions/inbox/`: New candidate drafts submitted by contributors.
2. `/submissions/accepted/`: Approved drafts placed here by maintainers, ready for compilation.
3. `/submissions/processed/`: Archival folder. The compiler automatically moves drafts here after successful integration into the database.

---

## The Compilation Script (`compile-contrib-posts.js`)
- **Location**: `tools/compile-contrib-posts.js`
- **Purpose**: Automates ingestion, parsing frontmatter, translating Markdown to HTML, running safety checks, and appending standard attribution footers.

### Ingestion Flow:
1. **Reads Approved Drafts**: Inspects `/submissions/accepted/` for `.md` or `.txt` files.
2. **Parses Frontmatter**: Extracts metadata structured between `---` YAML boundaries.
   - *Required metadata*: `title`, `summary`, `contributor`, `source`.
   - *Optional metadata*: `slug` (auto-generated if omitted), `publishedAt` (defaults to current timestamp if omitted), `tags`.
3. **Applies Validation Rules**:
   - Max summary length: 600 characters.
   - Slug check: Must be alphanumeric and hyphens only, lowercase, and unique.
   - Tag check: Requires at least one tag.
4. **HTML Transpiler (Markdown -> HTML)**:
   - Converts Markdown headers (`##`, `###`), lists (`-`), code snippets/fences (```), bold (`**`), and italics (`*`) to semantic HTML tags.
   - **Escapes Raw HTML**: Converts potential scripts and inline handlers (`on*`, `javascript:`) to safe strings to prevent XSS.
5. **Appends Attribution**: Attaches a standard contributor section at the bottom of the article:
   ```html
   <p><strong>Contributor:</strong> Contributor Name</p>
   <p>Read more here: <a href="Source URL" target="_blank" rel="noopener noreferrer">source</a></p>
   ```
6. **Commits and Moves**:
   - Prepends the new articles to the front of `posts.json`.
   - Moves the compiled draft files to `/submissions/processed/`.

## Running the Compiler

Maintainers should execute the compiler using the following commands:

```bash
# Perform a dry-run check without updating files
node tools/compile-contrib-posts.js --dry-run

# Run compilation and update posts.json (automatically archives files)
node tools/compile-contrib-posts.js
```

> [!IMPORTANT]
> Running the compiler updates `posts.json` but does not automatically rebuild static API files. After compilation, you **MUST** run the Static API Builder:
> ```bash
> node scripts/build-static-api.js
> ```

## Relevant Files
- [compile-contrib-posts.js](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/tools/compile-contrib-posts.js)
