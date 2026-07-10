import { Emitter } from './core/emitter'
import { createState, type ImageItem } from './core/state'
import { createDOM, destroyDOM, type ViewerElements } from './render/dom'
import { mount, unmount } from './mount'
import { attachGestures, type GestureControls } from './gestures'

export interface ViewerOptions {
  shadow?: boolean
}

export interface OpenOptions {
  src?: string
  alt?: string
  items?: ImageItem[]
  startIndex?: number
}

export interface Viewer {
  open(src: string): void
  open(options: OpenOptions): void
  close(): void
  next(): void
  prev(): void
  destroy(): void
  on(event: string, handler: (...args: any[]) => void): () => void
}

export function createViewer(options: ViewerOptions = {}): Viewer {
  const { shadow = true } = options
  const emitter = new Emitter()
  const state = createState()

  let elements: ViewerElements | null = null
  let hostEl: HTMLElement | null = null
  let containerEl: HTMLElement | ShadowRoot | null = null
  let gestures: GestureControls | null = null
  let keyHandler: ((e: KeyboardEvent) => void) | null = null

  function ensureDOM() {
    if (elements) return
    const { host, container } = mount(shadow)
    hostEl = host
    containerEl = container
    elements = createDOM(container)

    elements.overlay.addEventListener('click', (e) => {
      if (e.target === elements!.overlay) close()
    })

    elements.closeBtn.addEventListener('click', close)
    elements.prevBtn.addEventListener('click', prev)
    elements.nextBtn.addEventListener('click', next)
    elements.zoomInBtn.addEventListener('click', () => gestures?.zoomIn())
    elements.zoomOutBtn.addEventListener('click', () => gestures?.zoomOut())
  }

  function updateNavButtons() {
    if (!elements) return
    const showNav = state.items.length > 1
    elements.prevBtn.hidden = !showNav
    elements.nextBtn.hidden = !showNav
  }

  function renderCurrentImage() {
    if (!elements) return
    const item = state.items[state.currentIndex]
    if (!item) return
    elements.image.src = item.src
    elements.image.alt = item.alt ?? ''
  }

  function open(optsOrSrc: OpenOptions | string) {
    if (state.isOpen) return

    const opts: OpenOptions = typeof optsOrSrc === 'string' ? { src: optsOrSrc } : optsOrSrc

    if (opts.items) {
      state.items = opts.items
      state.currentIndex = opts.startIndex ?? 0
    } else if (opts.src) {
      const item: ImageItem = { src: opts.src }
      if (opts.alt) item.alt = opts.alt
      state.items = [item]
      state.currentIndex = 0
    } else {
      return
    }

    ensureDOM()
    renderCurrentImage()
    updateNavButtons()

    requestAnimationFrame(() => {
      elements!.overlay.setAttribute('data-open', '')
    })

    gestures = attachGestures(elements!.overlay, elements!.image)

    keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === '+' || e.key === '=') gestures?.zoomIn()
      if (e.key === '-' || e.key === '_') gestures?.zoomOut()
    }
    document.addEventListener('keydown', keyHandler)

    state.isOpen = true
    emitter.emit('open')
  }

  function close() {
    if (!state.isOpen) return

    elements?.overlay.removeAttribute('data-open')
    gestures?.detach()
    gestures = null

    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler)
      keyHandler = null
    }

    state.isOpen = false
    emitter.emit('close')
  }

  function next() {
    if (state.items.length <= 1) return
    state.currentIndex = (state.currentIndex + 1) % state.items.length
    renderCurrentImage()
  }

  function prev() {
    if (state.items.length <= 1) return
    state.currentIndex = (state.currentIndex - 1 + state.items.length) % state.items.length
    renderCurrentImage()
  }

  function destroy() {
    close()
    if (containerEl) destroyDOM(containerEl)
    if (hostEl) unmount(hostEl)
    elements = null
    hostEl = null
    containerEl = null
    emitter.clear()
  }

  return { open, close, next, prev, destroy, on: emitter.on.bind(emitter) }
}

export type { ImageItem }
