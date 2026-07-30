# Directory Update Log

## 2026-07-30
* **Update**: Synced OKF graph with the Unlock the Blog ship — static pre-render, Atom feed, JSON-LD, BUILD_ID cache busting, blogq tests, and CI publish.
* **Update**: Refreshed index blurbs under `workflows/`, `architecture/`, and `components/`.
* **Update**: Expanded [glossary](glossary.md) with Static API, Static Post Page, BUILD_ID, Atom Feed, JSON-LD, Publish Pipeline.
* **Update**: Rewrote [infrastructure.md](architecture/infrastructure.md) (CI publish workflow; removed obsolete "no CI/CD" claim).
* **Update**: Documented frontend BUILD_ID fetches; post_schema consumers for static pages/feed.
* **Add**: [static_generators.md](components/static_generators.md) concept for Node build utilities.
* **Update**: [ADR-003](../adr/ADR-003-hash-routing.md) consequences — static pages as primary crawl surface; hash routes for SPA UX.
* **Update**: Concept bodies [seo.md](workflows/seo.md) and [build_pipelines.md](workflows/build_pipelines.md) already reflected the new pipeline.

## 2026-07-06
* **Update**: Conformed root and subdirectory index files to OKF specification by removing forbidden frontmatter.
* **Update**: Resolved 20+ broken absolute links to use correct relative paths.
* **Update**: Made referencing paths in agent domain guidelines clickable relative markdown links.
* **Update**: Conformed `docs/adr/index.md` by removing forbidden frontmatter and fixing links to relative paths.
