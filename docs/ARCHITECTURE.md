# Architecture & Technology Choices

## Goals

- **Speed**: minimal overhead in the critical path (pointer event → transform update)
- **Good UX**: smooth animations, responsive gestures, accessible controls
- **Pluggable**: optional features loaded on demand (e.g. mobile gesture handling only when needed)

## Core Decisions

### Vanilla TypeScript (no framework)

The viewer's hot path is pointer events → coordinate math → CSS transform writes. Every abstraction layer between the event and the DOM write adds latency. A framework (React, Solid, Svelte) would introduce:

- Virtual DOM diffing or reactive subscriptions on every frame
- A runtime dependency users must reconcile with their own stack
- Larger bundle for no functional benefit in this domain

Vanilla TS gives us direct DOM access, zero runtime cost, and framework-agnostic consumption.

### Shadow DOM (optional, default on)

The viewer renders as a full-screen overlay. Shadow DOM provides:

- Complete style isolation — host page CSS cannot break viewer layout
- Encapsulated DOM — no ID/class collisions with consumer markup

Since the viewer only activates in a modal/overlay state, the known Shadow DOM pain points (event retargeting across boundaries, external style coordination) don't apply:

- All pointer events are handled inside the shadow root
- No gesture coordination with the host page is needed while the viewer is open
- `setPointerCapture`, `touch-action`, and keyboard events all work normally within the boundary

A `shadow: false` option is available for development (flat DOM, easier DevTools inspection) and for consumers who prefer it.

### Mount Strategy Abstraction

The rendering layer receives a generic container (`Element | ShadowRoot`) and doesn't know whether it's inside a shadow tree or not. This is achieved by a thin mount layer:

```
mount(shadow: boolean) → { host: HTMLElement, container: HTMLElement | ShadowRoot }
```

Styles are injected via `<style>` into the container in both modes.

### tsdown (Rolldown-based bundler)

- Output: ESM `.js` + `.d.ts` (package uses `"type": "module"`)
- tsdown is the maintained successor to tsup, powered by Rolldown (Rust)
- Build completes in ~500ms for the full library
- No CJS output — modern ESM-only package

### Vite (development only)

Vite serves the `playground/` directory with HMR for rapid iteration. It imports library source directly (no build step during dev). Not part of the production output.

### pnpm

Workspace-ready, strict dependency resolution, fast installs.

## Internal Architecture

```
src/
├── index.ts            # Public API: createViewer()
├── core/
│   ├── emitter.ts      # Typed event emitter
│   └── state.ts        # Viewer state (items, currentIndex, isOpen, scale)
├── gestures/
│   └── index.ts        # Pointer/touch event handling, transform math
├── render/
│   ├── dom.ts          # DOM element creation/destruction
│   ├── icons.ts        # Inline SVG icons (nav arrows, close button)
│   └── styles.ts       # CSS string (injected into container)
└── mount/
    └── index.ts        # Shadow DOM vs plain DOM mount strategy
```

### Layer responsibilities

| Layer | Knows about DOM? | Knows about Shadow DOM? | Side effects? |
|-------|-----------------|------------------------|---------------|
| core/ | No | No | No |
| gestures/ | Yes (events, transforms) | No | Yes (listeners) |
| render/ | Yes (createElement) | No | Yes (DOM mutation) |
| mount/ | Yes | Yes | Yes (attachShadow) |
| index.ts | Orchestrates all | Passes config to mount | Coordinates lifecycle |

### Gesture handling (planned)

Custom implementation, no gesture library. The viewer operates in a modal state where it fully owns input:

- Pointer events with `setPointerCapture` for reliable tracking
- Transform state: `{ scale, translateX, translateY }`
- Double-click/double-tap: toggle between 1x and 2x
- Scroll wheel: zoom at cursor position
- Drag: pan when zoomed in
- Pinch (mobile): two-finger zoom (future, conditionally loaded)

### Plugin architecture (future)

Dynamic `import()` for optional features:

```ts
if (isMobile()) {
  const { attachPinchZoom } = await import('./gestures/pinch')
  attachPinchZoom(container, image)
}
```

No plugin registry needed at MVP — just conditional dynamic imports within the library itself.
