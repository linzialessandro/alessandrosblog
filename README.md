# Alessandro's Blog

A minimalist static blog for sharing insights on AI, technology, and learning. Built with vanilla HTML, CSS, and JavaScript for maximum performance and simplicity.

🔗 **Live Site:** [alessandrosblog](https://alessandrosblog.it.eu.org/)

## Overview

This is a lightweight, static blog that prioritizes:
- **Performance**: No frameworks, no build steps for the main site
- **Privacy**: No tracking, no cookies
- **Simplicity**: Pure HTML/CSS/JS with a clean, readable design
- **Quality**: Automated validation and semantic checks for content

## Project Structure

```
.
├── index.html          # Main blog page with single-page routing & View Transitions
├── posts.json          # Blog posts source data (validated by blogq)
├── api/                # Static API endpoints for lazy loading
│   ├── index.json      # Metadata index of all posts (loaded on startup)
│   └── posts/          # Individual post JSON files (loaded on demand)
├── docs/               # Project documentation (OKF Knowledge Graph)
├── sitemap.xml         # SEO sitemap
├── pdfs/               # PDF versions of blog posts
├── scripts/            # Build and utility scripts
│   ├── build-pdfs.mjs  # PDF generation script
│   └── build-static-api.js # Splits posts.json into the static API
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

### Sitemap Generator

A Node.js script to generate `sitemap.xml` from `posts.json`. It accounts for both hash-based routes (`/#post/...`) and static HTML files (`/posts/...`) if they exist.

**Usage:**

```bash
# Generate sitemap.xml
node tools/generate-sitemap.js

# Dry run (print to console without writing)
node tools/generate-sitemap.js --dry-run
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

**Contributions are welcome!** 🎉

This blog is now open source, and I encourage contributions from the community. Whether you want to contribute features or content, please follow these guidelines:

### Contributing Features or Code

If you're interested in contributing to the codebase:

1. **Study the codebase thoroughly** before making changes
2. **Only contribute what you understand** - ensure you fully comprehend how your changes integrate with the existing architecture
3. **Respect the privacy-first philosophy** - this blog prioritizes user privacy with no tracking, no cookies, and no analytics. Any feature contributions must maintain these principles
4. Follow the existing code style and patterns
5. Test your changes locally before submitting
6. Run validation tools (e.g., `blogq`) to ensure quality

### Contributing Blog Posts

If you'd like to contribute a blog post:

**Content Guidelines:**

Posts should align with the blog's focus on **AI, technology, and learning**. Acceptable topics include:
- Artificial Intelligence and machine learning insights
- Technology trends, tools, and best practices
- Software development and engineering
- Learning experiences, tutorials, and educational content
- Research summaries and technical analysis

**Prohibited content:**
- Unlawful, illegal, or harmful content
- Spam, promotional content, or advertisements
- Offensive, discriminatory, or inflammatory material
- Topics unrelated to the blog's core philosophy
- Low-quality or AI-generated content without human insight

**Submission Process:**

We offer two frictionless ways to submit your work, directly accessible via the "Contribute" section on the blog's homepage:

1. **Submit via Web (Recommended)**: If you have a **free GitHub account**, you can submit your draft directly through the web browser. Click the "Submit a Post →" button on the website and select "Submit via GitHub Web Editor". It will open a pre-filled Markdown file in our repository. Simply replace the placeholder content with your article, and propose the new file!
2. **Submit via Email**: If you prefer not to use GitHub, you can send your draft via email to `alessandro.linzi.phd@icloud.com`. The link on the website will open your default email client with a pre-filled template.

**Manual / Advanced Submission:**

For users who want full control:
1. Fork the repository and clone it locally.
2. Draft your post as a `.md` file in `submissions/inbox/`.
3. Add the Front Matter (see below).
4. Submit a Pull Request.

**Draft Format Example:**

```markdown
---
title: My Insightful Post
summary: A brief summary of the post (max 600 chars).
tags: AI, Technology
source: https://example.com/source-article
contributor: Your Name
publishedAt: 2025-12-25T10:00:00+01:00
slug: my-insightful-post
---

Here is the body of the post. You can use:
- Paragraphs
- ## Headers
- - Lists
- [Links](https://example.com)
- \`inline code\`
```

**Maintainer Instructions:**

To compile accepted drafts into `posts.json` and generate the static API files:

1.  Move the draft to `submissions/accepted/`.
2.  Run the compiler:
    ```bash
    # Check what will happen
    node tools/compile-contrib-posts.js --dry-run
    
    # Compile and update posts.json (moves draft to processed/)
    node tools/compile-contrib-posts.js
    ```
3.  Re-generate the static API endpoints:
    ```bash
    node scripts/build-static-api.js
    ```


### General Guidelines

- Fix typos or improve content clarity
- Suggest new features or improvements
- Report bugs or issues
- Enhance the tooling or build process

Feel free to open an issue or submit a pull request on [GitHub](https://github.com/linzialessandro/alessandrosblog).

If you'd like to build a similar blog using this codebase, you're welcome to do so under the MIT license.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Content © Alessandro Linzi.
