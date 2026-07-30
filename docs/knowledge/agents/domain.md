---
type: Concept
title: Domain Docs
description: How engineering skills should consume this repo's domain documentation.
tags: [agents, guidelines, domain]
timestamp: 2026-07-30T23:45:00Z
---

# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **[Glossary](../glossary.md)** for domain terminology.
- **[Architecture Decision Records](../../adr/index.md)** — read ADRs that touch the area you're about to work in.


If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo OKF structure (repository root is the Website):

```
/
├── docs/knowledge/     # Concepts, glossary, log, agent guidelines
├── docs/adr/           # Architecture decision records
├── assets/js/          # SPA modules
├── scripts/            # Static generators (API, pages, PDFs)
├── tools/              # blogq, feed/sitemap generators
├── api/                # Generated Static API
├── posts/              # Generated Static Post Pages
└── posts.json          # Source of truth for Posts
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the [Glossary](../glossary.md). Don't drift to synonyms the glossary explicitly avoids.


## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding.
