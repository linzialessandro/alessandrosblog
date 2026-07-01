---
type: Concept
title: Frontend SPA Architecture
description: Details the modular client-side SPA architecture, state management, and View Transitions-based routing.
resource: Website/assets/js/
tags: [architecture, frontend, javascript, spa]
timestamp: 2026-06-30T18:23:00Z
---

# Frontend SPA Architecture

Alessandro's Blog is built as a modular client-side Single Page Application (SPA). To maintain high performance and avoid framework bloat, it uses vanilla JavaScript modules organized into a clean Model-View-Controller (MVC) pattern.

## Core Architecture Components

The application state and presentation flow are driven by three modules located in `/assets/js/`:

### 1. The Model: `store.js` (`BlogStore`)
- **Responsibility**: Manages the local cache of posts, filters (active tags), and state updates.
- **State Properties**:
  - `posts`: Full list of blog posts metadata (sorted newest-first).
  - `selectedTags`: Set of currently active filter tag strings.
  - `allTags`: Sorted Set of every unique tag across all posts.
- **Features**:
  - Fetches the static index `api/index.json` on startup.
  - Exposes pure functions (e.g., `calculateToggledTags`) to calculate intent, but only mutates state when commanded via `setFilter()`.
  - Emits change events using a callback queue (`onChange`).

### 2. The View: `renderer.js` (`Renderer`)
- **Responsibility**: Coordinates all DOM mutations, handles color themes, controls modals, and emits user intents.
- **Theme Caching**:
  - Automatically loads and toggles between light and dark modes.
  - Persists preference locally in `localStorage` using key `theme`.
- **Render Targets**:
  - Homepage grid displaying filtered list items.
  - Active tag popover filter list with tag search.
  - Post detail view (fetches lazy-loaded `/api/posts/{slug}.json`).
  - Full-screen informational Modals (Behind the Scenes, Contribute) with intersection observers for scroll reveals.

### 3. The Router: `router.js` (`Router`)
- **Responsibility**: A pure URL parser that monitors browser location hashes and translates them into application state.
- **Hash Schema**:
  - Homepage (no filter): empty hash (``).
  - Homepage (filtered): `#tags=AI,Technology`.
  - Privacy page: `#privacy`.
  - Individual Post: `#post/{slug}`.
- **Events**:
  - Emits `onRoute(state)` whenever the URL changes. It performs zero DOM manipulation or View Transitions.

### 4. The Orchestrator: `main.js`
- **Responsibility**: Acts as the adapter that wires the decoupled modules together.
- **Features**:
  - Listens to `Renderer` intents (e.g., `onFilterToggle(tag)`) and updates the `Router` (URL).
  - Listens to `Router` state changes (`onRoute`) and coordinates DOM updates via the `Renderer` and state updates via the `Store`.
  - Orchestrates modern browser native `document.startViewTransition` API if supported, enabling fluid DOM morph animations.

## Workflow Overview

```mermaid
graph TD
    User[User Clicks Filter] -->|onFilterToggle| Main1[main.js]
    Main1 -->|calculateToggledTags| Store[BlogStore]
    Main1 -->|updateTagsHash| Router[Router (URL)]
    
    Browser[Browser Hash Change] --> Router
    Router -->|onRoute| Main2[main.js]
    Main2 -->|setFilter| Store
    Main2 -->|showView / renderPostPage| Renderer[Renderer]
    
    Store -->|_notify / onChange| Main3[main.js]
    Main3 -->|renderHomepage| Renderer
    Renderer -->|Build DOM| DOM[DOM]
```

## Relevant Files
- [main.js](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/assets/js/main.js) (Entry point wireframe)
- [store.js](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/assets/js/store.js)
- [renderer.js](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/assets/js/renderer.js)
- [router.js](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/assets/js/router.js)
