---
type: Concept
title: CSS Design System
description: Documents the design token architecture, layout primitives, dark mode mechanism, animation system, and all major component classes.
resource: Website/assets/css/style.css
tags: [architecture, css, design, tokens, theming]
timestamp: 2026-06-30T18:27:00Z
---

# CSS Design System

The blog's visual identity is defined in a single file, `assets/css/style.css`, using a token-based approach built on CSS custom properties. There are no utility frameworks — every style is intentional and authored directly.

## Design Tokens (CSS Custom Properties)

All foundational values are declared in `:root` and overridden by `[data-theme="dark"]`. This creates a predictable, single-source design system.

### Color Palette

| Token | Light Value | Dark Value | Usage |
|---|---|---|---|
| `--bg` | `#FAF9F6` (warm ivory) | `#0D0B0A` (near-black) | Page background |
| `--bg-raised` | `rgba(255,255,255,0.85)` | `rgba(24,21,19,0.85)` | Cards, popovers, nav |
| `--text` | `#1C1917` (charcoal) | `#F5F0EB` (cream) | Primary text |
| `--text-2` | `#78716C` | `#A8A29E` | Secondary text (summaries, labels) |
| `--text-3` | `#A8A29E` | `#57534E` | Tertiary / muted (dates, captions) |
| `--border` | `rgba(28,25,23,0.10)` | `rgba(245,240,235,0.08)` | Default separators |
| `--border-strong` | `rgba(28,25,23,0.20)` | `rgba(245,240,235,0.18)` | Hover/focus borders |
| `--accent` | `#92400E` (deep amber) | `#FBBF24` (warm gold) | CTAs, links, highlights |
| `--accent-light` | `#D97706` | `#FDE68A` | Gradient endpoints |
| `--ring` | `rgba(146,64,14,0.25)` | `rgba(251,191,36,0.3)` | Focus/hover glows |

### Typography
| Token | Value |
|---|---|
| `--font-sans` | `"DM Sans", system-ui, sans-serif` |
| `--font-serif` | `"Playfair Display", Georgia, serif` |

Headings use `--font-serif` (italic, weight 400). Body text uses `--font-sans` (weight 300).

### Layout & Motion
| Token | Value | Purpose |
|---|---|---|
| `--side` | `clamp(1.5rem, 9vw, 9rem)` | Responsive horizontal padding |
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | Springy easing for all transitions |
| `--dur` | `200ms` | Base transition duration |

---

## The `.wrap` Layout Primitive

The single layout primitive used throughout the site. Provides centred, max-width content with responsive side breathing room.

```css
.wrap {
    width: 100%;
    max-width: calc(1100px + var(--side) * 2);
    margin: auto;
    padding-left: var(--side);
    padding-right: var(--side);
}
```

At 375px viewport: `~1.5rem` side padding. At 1280px+: `9rem` (144px) side padding, content ≤ 992px wide.

---

## Dark Mode Mechanism

The theme system uses three layers:

1. **System Default**: A `@media (prefers-color-scheme: dark)` block on `:root:not([data-theme])` auto-applies dark tokens if the user has no explicit preference stored.
2. **Explicit Toggle**: `Renderer.applyTheme(t)` sets or removes `data-theme="dark"` on `<html>`.
3. **Persistence**: The chosen theme is stored in `localStorage` under the key `theme`. On init, `Renderer.initTheme()` reads this value and falls back to the system media query result.

---

## Animation System

### `riseIn` — Entrance animation
Used on hero elements for a staggered page load effect:
```css
@keyframes riseIn {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: none; }
}
```
Hero elements use delays (0.05s → 0.8s) to cascade the entrance.

### `scrollDrop` — Hero scroll indicator
Animates the thin vertical scroll line in the hero section:
```css
@keyframes scrollDrop {
    0%   { transform: scaleY(0); opacity: 0; }
    30%  { transform: scaleY(1); opacity: 1; }
    70%  { transform: scaleY(1); opacity: 1; }
    100% { transform: scaleY(0) translateY(100%); opacity: 0; }
}
```

### View Transitions
Page transitions use the browser-native `document.startViewTransition()` API (see [Frontend Architecture](/docs/knowledge/architecture/frontend.md)).

---

## Key Component Classes

| Class | Description |
|---|---|
| `.site-nav` | Fixed glassmorphism navbar with `backdrop-filter: blur(20px)` |
| `.site-hero` | Full-viewport hero stage (`min-height: 100dvh`) |
| `.wrap` | Centred layout container |
| `.post-card` | Archive list item with top-border hover accent |
| `.post-content` | 68ch-wide reading column for article body |
| `.filter-popover` | Glassmorphism tag filter popover with `@starting-style` open animation |
| `.filter-chip` | Selectable tag button (`selected` state = inverted colours) |
| `.sidebar-card` | Sticky sidebar card with backdrop blur |
| `.reading-progress` | Top-of-page reading progress bar (set via JS scroll events) |
| `.related-posts` | Tag-scored related posts aside |
| `.post-nav` | Two-column Prev/Next navigation grid |
| `.bts-modal` | "Behind the Scenes" full-screen overlay modal |
| `.scroll-reveal` | Elements observed by `IntersectionObserver` for fade-in inside the BTS modal |

---

## Accessibility Considerations

- `@media (prefers-reduced-motion: reduce)` disables all animations globally.
- All interactive elements have `focus-visible` outlines using `--accent`.
- Hover effects are wrapped in `@media (hover: hover) and (pointer: fine)` to avoid sticky hover states on touch devices.

## Relevant Files
- [style.css](file:///Users/alessandro/Library/Mobile%20Documents/iCloud~AsheKube~Carnets/Documents/Projects/Blog/Website/assets/css/style.css)
