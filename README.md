# Alessandro's Blog

A minimalist static blog for sharing insights on AI, technology, and learning. Built with vanilla HTML, CSS, and JavaScript for maximum performance and simplicity.

🔗 **Live Site:** [alessandrosblog](https://alessandrosblog.it.eu.org/)

## Overview

This is a lightweight, static blog that prioritizes:
- **Performance**: No frameworks, no build steps for the main site
- **Privacy**: No tracking, no analytics, no cookies
- **Simplicity**: Pure HTML/CSS/JS with a clean, readable design
- **Quality**: Automated validation and semantic checks for content

## Project Structure

```
.
├── index.html          # Main blog page with single-page routing
├── posts.json          # Blog posts data (validated by blogq)
├── sitemap.xml         # SEO sitemap
├── pdfs/               # PDF versions of blog posts
├── scripts/            # Build and utility scripts
│   └── build-pdfs.mjs  # PDF generation script
└── tools/              # Development and validation tools
    └── blogq/          # Posts validation tool
```

## Local Development

To view the blog locally, serve the directory using a simple HTTP server:

```bash
# Using Python 3
python3 -m http.server 8000

# Then visit http://localhost:8000
```

## Tools

### blogq - Blog Post Validator

A Python-based CLI tool for validating `posts.json` against a JSON schema and performing semantic checks.

**Features:**
- JSON schema validation (structure, required fields, data types)
- Semantic checks (slug format, duplicate detection, security validation)
- Validates `target="_blank"` links include `rel="noopener"` for security
- Checks for whitespace in tags and other quality issues

**Installation:**

```bash
# Create and activate a virtual environment (recommended)
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install blogq in editable mode
cd tools/blogq
pip install -e .
```

**Usage:**

```bash
# Validate posts.json
blogq check posts.json

# Get help
blogq --help
```

**Example output:**
```
ERROR <schema> /posts/5/slug: Slug violates policy.
WARN  my-post /posts/3/tags/0: Tag has leading/trailing whitespace.
```

## Content Guidelines

When adding new blog posts to `posts.json`:

1. **Required fields**: `title`, `slug`, `publishedAt`, `summary`, `tags`, `content`
2. **Slug format**: Lowercase letters, numbers, and hyphens only (e.g., `my-blog-post`)
3. **Date format**: ISO 8601 datetime (e.g., `2025-12-20T10:00:00Z`)
4. **Summary**: Maximum 600 characters
5. **Tags**: At least one tag, no duplicates, no leading/trailing whitespace
6. **External links**: Use `target="_blank" rel="noopener noreferrer"` for security

Always run `blogq check posts.json` before committing changes.

## Contributing

This is a personal blog, but if you notice any issues or have suggestions, feel free to open an issue.

## License

Content © Alessandro Linzi. Code is available for reference and learning purposes.
