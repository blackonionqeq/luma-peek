import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { attachGestures, type GestureControls } from './index'

// simulated image layout: 480x320 at (400, 200) → center (640, 360)
const CENTER_X = 640
const CENTER_Y = 360

let container: HTMLElement
let image: HTMLImageElement
let controls: GestureControls

function parseTransform(): { tx: number; ty: number; scale: number } | null {
  const t = image.style.transform
  if (!t) return null
  const m = /translate\((-?[\d.]+)px, (-?[\d.]+)px\) scale\((-?[\d.]+)\)/.exec(t)
  if (!m) throw new Error(`unexpected transform: ${t}`)
  return { tx: parseFloat(m[1]!), ty: parseFloat(m[2]!), scale: parseFloat(m[3]!) }
}

function pointer(type: string, pointerId: number, x: number, y: number, target: Element = container) {
  target.dispatchEvent(new PointerEvent(type, { pointerId, clientX: x, clientY: y, bubbles: true }))
}

function dblclick(x: number, y: number) {
  image.dispatchEvent(new MouseEvent('dblclick', { clientX: x, clientY: y, bubbles: true }))
}

function click(): number {
  let received = 0
  const count = () => received++
  container.addEventListener('click', count)
  container.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  container.removeEventListener('click', count)
  return received
}

beforeEach(() => {
  container = document.createElement('div')
  image = document.createElement('img')
  container.appendChild(image)
  document.body.appendChild(container)

  // happy-dom has no layout engine; the gesture code only reads the rect
  // center, which is layout-center + translate regardless of scale
  image.getBoundingClientRect = () => {
    const t = parseTransform()
    const tx = t?.tx ?? 0
    const ty = t?.ty ?? 0
    return {
      left: 400 + tx,
      top: 200 + ty,
      right: 880 + tx,
      bottom: 520 + ty,
      width: 480,
      height: 320,
      x: 400 + tx,
      y: 200 + ty,
      toJSON: () => ({}),
    } as DOMRect
  }

  // container fills a 1280x720 viewport, so its center matches the image's
  container.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: 1280,
      bottom: 720,
      width: 1280,
      height: 720,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect

  controls = attachGestures(container, image)
})

afterEach(() => {
  controls.detach()
  container.remove()
})

describe('double-click zoom', () => {
  it('zooms to 2x keeping the clicked point fixed, second dblclick resets', () => {
    dblclick(700, 300)
    // translate = center - focal point
    expect(parseTransform()).toEqual({ tx: -60, ty: 60, scale: 2 })

    dblclick(700, 300)
    expect(parseTransform()).toBeNull()
  })
})

describe('pinch-zoom', () => {
  it('zooms around the midpoint and pans with it', () => {
    pointer('pointerdown', 1, 600, 400)
    pointer('pointerdown', 2, 680, 400)
    // distance 80 → 160 doubles the scale; derived by hand from the
    // focal-zoom formula plus the midpoint shift of (+40, 0)
    pointer('pointermove', 2, 760, 400)

    const t = parseTransform()!
    expect(t.scale).toBeCloseTo(2)
    expect(t.tx).toBeCloseTo(0)
    expect(t.ty).toBeCloseTo(-40)
  })

  it('final scale equals total distance ratio across multiple moves', () => {
    pointer('pointerdown', 1, 600, 400)
    pointer('pointerdown', 2, 680, 400)
    pointer('pointermove', 2, 760, 400)
    pointer('pointermove', 1, 520, 400)

    // 80px → 240px apart
    expect(parseTransform()!.scale).toBeCloseTo(3)
  })

  it('clamps scale at the maximum', () => {
    pointer('pointerdown', 1, 600, 400)
    pointer('pointerdown', 2, 680, 400)
    pointer('pointermove', 2, 1400, 400) // 10x distance ratio

    expect(parseTransform()!.scale).toBe(8)
  })

  it('snaps back to reset when pinched down to 1x', () => {
    dblclick(CENTER_X, CENTER_Y)
    expect(parseTransform()!.scale).toBe(2)

    pointer('pointerdown', 1, 600, 400)
    pointer('pointerdown', 2, 760, 400)
    pointer('pointermove', 2, 680, 400) // halve the distance: 2x → 1x
    pointer('pointerup', 1, 600, 400)
    pointer('pointerup', 2, 680, 400)

    expect(parseTransform()).toBeNull()
  })

  it('hands off to a drag when one finger lifts', () => {
    pointer('pointerdown', 1, 600, 400)
    pointer('pointerdown', 2, 680, 400)
    pointer('pointermove', 2, 760, 400) // scale 2, translate (0, -40)
    pointer('pointerup', 1, 600, 400)

    pointer('pointermove', 2, 770, 420)
    const t = parseTransform()!
    expect(t.scale).toBeCloseTo(2)
    expect(t.tx).toBeCloseTo(10)
    expect(t.ty).toBeCloseTo(-20)
  })
})

describe('drag-to-pan', () => {
  it('pans from a drag starting outside the image when zoomed', () => {
    dblclick(CENTER_X, CENTER_Y) // scale 2, translate (0, 0)

    pointer('pointerdown', 1, 100, 100) // overlay corner, off the image
    pointer('pointermove', 1, 250, 300)

    const t = parseTransform()!
    expect(t.scale).toBe(2)
    expect(t.tx).toBe(150)
    expect(t.ty).toBe(200)
  })

  it('does nothing at scale 1', () => {
    pointer('pointerdown', 1, 100, 100)
    pointer('pointermove', 1, 300, 300)
    pointer('pointerup', 1, 300, 300)

    expect(parseTransform()).toBeNull()
    expect(click()).toBe(1) // and the following click is not swallowed
  })

  it('ignores pointers that go down on buttons', () => {
    const button = document.createElement('button')
    container.appendChild(button)
    dblclick(CENTER_X, CENTER_Y)

    pointer('pointerdown', 1, 300, 300, button)
    pointer('pointermove', 1, 400, 400)

    expect(parseTransform()).toEqual({ tx: 0, ty: 0, scale: 2 })
  })
})

describe('click suppression', () => {
  function drag() {
    pointer('pointerdown', 1, 100, 100)
    pointer('pointermove', 1, 200, 250)
    pointer('pointerup', 1, 200, 250)
  }

  it('swallows only the click generated by a pan release', () => {
    dblclick(CENTER_X, CENTER_Y)
    drag()

    expect(click()).toBe(0)
    expect(click()).toBe(1)
  })

  it('does not swallow clicks once the release has settled', async () => {
    dblclick(CENTER_X, CENTER_Y)
    drag()

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(click()).toBe(1)
  })

  it('does not swallow the click of a stationary press while zoomed', () => {
    dblclick(CENTER_X, CENTER_Y)
    pointer('pointerdown', 1, 100, 100)
    pointer('pointerup', 1, 100, 100)

    expect(click()).toBe(1)
  })
})

describe('zoom controls', () => {
  it('zoomIn steps the scale by 1.5x around the container center', () => {
    controls.zoomIn()
    expect(parseTransform()).toEqual({ tx: 0, ty: 0, scale: 1.5 })

    controls.zoomIn()
    expect(parseTransform()!.scale).toBeCloseTo(2.25)
  })

  it('zoomIn clamps at the maximum scale', () => {
    for (let i = 0; i < 10; i++) controls.zoomIn()
    expect(parseTransform()!.scale).toBe(8)
  })

  it('zoomOut keeps the container center fixed', () => {
    dblclick(700, 300) // scale 2, translate (-60, 60)
    controls.zoomOut()

    // zooming around the container center scales the translate by the
    // ratio (4/3) / 2 = 2/3
    const t = parseTransform()!
    expect(t.scale).toBeCloseTo(4 / 3)
    expect(t.tx).toBeCloseTo(-40)
    expect(t.ty).toBeCloseTo(40)
  })

  it('zoomOut resets fully once the scale would reach 1x', () => {
    controls.zoomIn()
    controls.zoomOut()
    expect(parseTransform()).toBeNull()
  })

  it('zoomOut at scale 1 stays reset', () => {
    controls.zoomOut()
    expect(parseTransform()).toBeNull()
  })
})

describe('reset', () => {
  it('clears the transform but keeps handling events', () => {
    dblclick(CENTER_X, CENTER_Y)
    expect(parseTransform()).not.toBeNull()

    controls.reset()
    expect(parseTransform()).toBeNull()

    dblclick(CENTER_X, CENTER_Y)
    expect(parseTransform()).not.toBeNull()
  })

  it('abandons an in-progress drag', () => {
    dblclick(CENTER_X, CENTER_Y)
    pointer('pointerdown', 1, 100, 100)
    pointer('pointermove', 1, 150, 150)

    controls.reset()
    pointer('pointermove', 1, 300, 300)
    expect(parseTransform()).toBeNull()
  })
})

describe('detach', () => {
  it('resets the transform and stops handling events', () => {
    dblclick(CENTER_X, CENTER_Y)
    expect(parseTransform()).not.toBeNull()

    controls.detach()
    expect(parseTransform()).toBeNull()

    dblclick(CENTER_X, CENTER_Y)
    expect(parseTransform()).toBeNull()
  })
})
