# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Vite dev server for playground (localhost:5173)
pnpm build      # Bundle library with tsdown → dist/
pnpm test       # Run tests with Vitest
npx tsc --noEmit  # Type-check only (strict mode, exactOptionalPropertyTypes enabled)
```

## Architecture

luma-peek is a framework-agnostic image viewer library. Zero runtime dependencies. Pure TypeScript compiled to ESM.

### Layer structure (src/)

- **core/** — Framework-free logic: event emitter, viewer state machine. No DOM knowledge.
- **gestures/** — Pointer/touch event handling (double-click zoom, drag-to-pan, pinch-zoom; future: scroll-zoom). Operates on elements passed in, doesn't create DOM.
- **render/** — DOM creation, CSS styles (injected via `<style>`), SVG icons. Produces a `ViewerElements` struct.
- **mount/** — Container strategy: either plain `<div>` or Shadow DOM host. Returns a container (`HTMLElement | ShadowRoot`) that render writes into.
- **index.ts** — Public API surface. Wires all layers together in `createViewer()`.

### Key design decisions

- Shadow DOM is the default (`shadow: true`) for style isolation in production; pass `shadow: false` during development for flat DOM debugging.
- The viewer is modal/fullscreen — it takes over events only when open, zero listeners when closed.
- Styles use a class prefix (`lp-`) and are injected into the container (works in both shadow and non-shadow mode).
- `adoptedStyleSheets` is not used yet; styles go in a `<style>` element inside the container.

### Build

- tsdown bundles `src/index.ts` → `dist/index.js` + `dist/index.d.ts` (ESM only, `"type": "module"`).
- `outExtensions` forces `.js`/`.d.ts` instead of tsdown's default `.mjs`/`.d.mts`.

### Playground

`playground/` is a standalone Vite app that imports directly from `../src` (no build step needed during dev). Used for manual testing with HMR.

### TypeScript strictness

`exactOptionalPropertyTypes` is enabled — optional properties cannot accept explicit `undefined`. When constructing objects with optional fields, only assign the field conditionally (e.g., `if (val) obj.field = val`).
