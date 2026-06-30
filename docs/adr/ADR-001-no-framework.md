---
type: ADR
title: "ADR-001: No JavaScript Framework"
description: Decision to build the blog using vanilla JavaScript modules instead of a framework like React, Vue, or Svelte.
tags: [adr, architecture, javascript, performance]
timestamp: 2026-06-30T18:27:00Z
---

# ADR-001: No JavaScript Framework

**Status:** Accepted  
**Date:** 2026

---

## Context

When building the blog, the standard default for modern web projects is to reach for a framework (React, Vue, Svelte, SolidJS, etc.). These frameworks provide:
- Component abstractions and reactive state
- Toolchains with hot reloading
- Rich ecosystems

However, the blog has a well-defined, narrow scope: display a list of posts, filter by tag, and render individual post content. The interaction surface is minimal.

---

## Decision

Build with **vanilla JavaScript ES modules** (`import`/`export`) organised into three classes: `BlogStore`, `Renderer`, `Router`. No build step. No `node_modules` shipped to the browser.

---

## Rationale

1. **Performance**: Zero framework payload. The browser parses and executes only the code the site actually uses.
2. **Simplicity**: No framework version upgrades, no breaking changes, no toolchain to maintain. The site will work in 10 years without modification.
3. **Privacy alignment**: No third-party runtime scripts from CDNs. The philosophy of the blog — no tracking, no unnecessary dependencies — extends to the codebase.
4. **Learning intent**: The blog is documented as a "vibe coding" experiment to study the web platform directly. Using a framework would obscure the platform primitives.

---

## Consequences

- **No component reuse ecosystem**: Patterns like the popover or modal must be hand-authored.
- **No reactivity primitives**: State management is handled by a simple observer pattern (`store.onChange(callback)`).
- **Manual DOM updates**: `Renderer` imperatively builds HTML strings and sets `innerHTML`. This is intentional given the limited interaction surface.
- **No TypeScript**: Accepting the tradeoff of less static analysis for zero compilation.
