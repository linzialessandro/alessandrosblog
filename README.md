# Alessandro's Blog

Welcome to Alessandro's Blog. This project is a simple, static website sharing insights and posts.

## Project Structure

- `index.html`: The main entry point for the blog.
- `posts.json`: Contains the blog posts data.
- `convert.js`: Script for data conversion/handling.

## Usage

To view the blog locally, you can serve the directory using a simple HTTP server. For example, with Python 3:

```bash
python3 -m http.server 8000
```

## Tools

This repository includes custom tools to help maintain and validate the blog data.

### blogq

Located in `tools/blogq`, this is a Python-based utility for validating `posts.json` against a JSON schema and performing semantic checks on the blog posts.

To install and use `blogq`:
1. Navigate to `tools/blogq`.
2. Install the package in editable mode: `pip install -e .`.
3. Run the tool: `blogq --help`.
