# luma-peek

A fast, pluggable image viewer for the web.

## Install

```bash
pnpm add luma-peek
```

## Usage

```ts
import { createViewer } from 'luma-peek'

const viewer = createViewer()

// Simplest — just a URL
viewer.open('https://example.com/photo.jpg')

// With options
viewer.open({ src: '/photo.jpg', alt: 'A photo' })

// Gallery mode
viewer.open({
  items: [
    { src: '/img1.jpg', alt: 'First' },
    { src: '/img2.jpg', alt: 'Second' },
    { src: '/img3.jpg' },
  ],
  startIndex: 0,
})
```

## API

### `createViewer(options?)`

Creates a viewer instance.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `shadow` | `boolean` | `true` | Use Shadow DOM for style isolation |

### Instance methods

| Method | Description |
|--------|-------------|
| `open(src)` | Open with an image URL string |
| `open(options)` | Open with options (`src`, `alt`, `items`, `startIndex`) |
| `close()` | Close the viewer |
| `next()` | Navigate to next image (gallery mode) |
| `prev()` | Navigate to previous image (gallery mode) |
| `destroy()` | Remove all DOM and event listeners |
| `on(event, handler)` | Subscribe to events, returns unsubscribe function |

### Events

| Event | Description |
|-------|-------------|
| `open` | Fired when viewer opens |
| `close` | Fired when viewer closes |

## Interactions

- **Double-click** — Toggle zoom (1x ↔ 2x)
- **Pinch** — Two-finger zoom (1x–8x), snaps back when pinched below 1x
- **Drag** — Pan when zoomed; works anywhere on the overlay, not just the image
- **Scroll wheel** — Zoom in/out (planned)
- **Esc** — Close
- **Click backdrop** — Close
- **Arrow keys** — Navigate gallery

## License

MIT
