const MIN_SCALE = 1
const MAX_SCALE = 8
const DRAG_THRESHOLD = 3
const ZOOM_STEP = 1.5

export interface GestureControls {
  zoomIn(): void
  zoomOut(): void
  reset(): void
  detach(): void
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

// throws NotFoundError if the pointer is already inactive (released mid-gesture)
function capturePointer(el: HTMLElement, pointerId: number) {
  try {
    el.setPointerCapture(pointerId)
  } catch {
    /* pointer no longer active */
  }
}

export function attachGestures(container: HTMLElement, image: HTMLElement): GestureControls {
  let scale = 1
  let translateX = 0
  let translateY = 0

  const pointers = new Map<number, { x: number; y: number }>()
  let mode: 'idle' | 'drag' | 'pinch' = 'idle'

  let dragMoved = false
  let suppressClick = false

  let startX = 0
  let startY = 0
  let startTx = 0
  let startTy = 0

  let prevDist = 0
  let prevMidX = 0
  let prevMidY = 0

  function applyTransform() {
    image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
  }

  function resetTransform() {
    scale = 1
    translateX = 0
    translateY = 0
    image.style.transform = ''
    image.style.cursor = ''
  }

  // transform-origin is the element center, so the transformed rect center is
  // always layout-center + translate, regardless of scale
  function imageCenter(): { x: number; y: number } {
    const rect = image.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2 - translateX,
      y: rect.top + rect.height / 2 - translateY,
    }
  }

  // rescale while keeping the image point under (fx, fy) fixed on screen
  function zoomAround(fx: number, fy: number, nextScale: number) {
    const c = imageCenter()
    const ratio = nextScale / scale
    translateX = fx - c.x - ratio * (fx - c.x - translateX)
    translateY = fy - c.y - ratio * (fy - c.y - translateY)
    scale = nextScale
  }

  function firstTwoPointers(): [{ x: number; y: number }, { x: number; y: number }] {
    const [p1, p2] = pointers.values()
    return [p1!, p2!]
  }

  function startPinch() {
    mode = 'pinch'
    const [p1, p2] = firstTwoPointers()
    prevDist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
    prevMidX = (p1.x + p2.x) / 2
    prevMidY = (p1.y + p2.y) / 2
    for (const id of pointers.keys()) capturePointer(container, id)
    image.style.transition = 'none'
  }

  function startDrag(x: number, y: number) {
    mode = 'drag'
    dragMoved = false
    startX = x
    startY = y
    startTx = translateX
    startTy = translateY
    image.style.cursor = 'grabbing'
    image.style.transition = 'none'
  }

  function handleDblClick(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (scale !== 1) {
      resetTransform()
      return
    }

    zoomAround(e.clientX, e.clientY, 2)
    applyTransform()
    image.style.cursor = 'grab'
  }

  function handlePointerDown(e: PointerEvent) {
    if (e.target instanceof Element && e.target.closest('button')) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.size === 2) {
      e.preventDefault()
      startPinch()
    } else if (pointers.size === 1 && scale > 1) {
      e.preventDefault()
      startDrag(e.clientX, e.clientY)
      capturePointer(container, e.pointerId)
    }
  }

  function handlePointerMove(e: PointerEvent) {
    const p = pointers.get(e.pointerId)
    if (!p) return
    p.x = e.clientX
    p.y = e.clientY

    if (mode === 'pinch' && pointers.size >= 2) {
      const [p1, p2] = firstTwoPointers()
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      const midX = (p1.x + p2.x) / 2
      const midY = (p1.y + p2.y) / 2

      if (prevDist > 0) {
        zoomAround(midX, midY, clamp((scale * dist) / prevDist, MIN_SCALE, MAX_SCALE))
      }
      translateX += midX - prevMidX
      translateY += midY - prevMidY

      prevDist = dist
      prevMidX = midX
      prevMidY = midY
      applyTransform()
    } else if (mode === 'drag') {
      translateX = startTx + (e.clientX - startX)
      translateY = startTy + (e.clientY - startY)
      if (!dragMoved && Math.hypot(e.clientX - startX, e.clientY - startY) > DRAG_THRESHOLD) {
        dragMoved = true
      }
      applyTransform()
    }
  }

  function endGestureClickGuard() {
    suppressClick = true
    setTimeout(() => {
      suppressClick = false
    }, 0)
  }

  function handlePointerUp(e: PointerEvent) {
    if (!pointers.delete(e.pointerId)) return
    if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId)

    if (mode === 'pinch') {
      if (pointers.size >= 2) {
        startPinch()
        return
      }
      endGestureClickGuard()
      if (scale <= 1.01) {
        image.style.transition = ''
        resetTransform()
        mode = 'idle'
      } else if (pointers.size === 1) {
        const [remaining] = pointers.values()
        startDrag(remaining!.x, remaining!.y)
      } else {
        mode = 'idle'
        image.style.transition = ''
        image.style.cursor = 'grab'
      }
    } else if (mode === 'drag' && pointers.size === 0) {
      mode = 'idle'
      image.style.transition = ''
      image.style.cursor = scale > 1 ? 'grab' : ''
      if (dragMoved) endGestureClickGuard()
    }
  }

  // a drag or pinch released over the overlay also fires a click there, which
  // would close the viewer; swallow that one click before it reaches the overlay
  function handleClickCapture(e: MouseEvent) {
    if (!suppressClick) return
    suppressClick = false
    e.preventDefault()
    e.stopPropagation()
  }

  function containerCenter(): { x: number; y: number } {
    const rect = container.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  function zoomIn() {
    const c = containerCenter()
    zoomAround(c.x, c.y, clamp(scale * ZOOM_STEP, MIN_SCALE, MAX_SCALE))
    applyTransform()
    image.style.cursor = 'grab'
  }

  function zoomOut() {
    const next = scale / ZOOM_STEP
    if (next <= 1) {
      resetTransform()
      return
    }
    const c = containerCenter()
    zoomAround(c.x, c.y, next)
    applyTransform()
  }

  function reset() {
    pointers.clear()
    mode = 'idle'
    image.style.transition = ''
    resetTransform()
  }

  image.addEventListener('dblclick', handleDblClick)
  container.addEventListener('pointerdown', handlePointerDown)
  container.addEventListener('pointermove', handlePointerMove)
  container.addEventListener('pointerup', handlePointerUp)
  container.addEventListener('pointercancel', handlePointerUp)
  window.addEventListener('click', handleClickCapture, true)

  function detach() {
    image.removeEventListener('dblclick', handleDblClick)
    container.removeEventListener('pointerdown', handlePointerDown)
    container.removeEventListener('pointermove', handlePointerMove)
    container.removeEventListener('pointerup', handlePointerUp)
    container.removeEventListener('pointercancel', handlePointerUp)
    window.removeEventListener('click', handleClickCapture, true)
    reset()
  }

  return { zoomIn, zoomOut, reset, detach }
}
