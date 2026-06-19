export function attachGestures(_container: HTMLElement, image: HTMLElement): () => void {
  let scale = 1
  let translateX = 0
  let translateY = 0

  let dragging = false
  let startX = 0
  let startY = 0
  let startTx = 0
  let startTy = 0

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

  function handleDblClick(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (scale !== 1) {
      resetTransform()
      return
    }

    scale = 2
    const rect = image.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    translateX = (cx - e.clientX)
    translateY = (cy - e.clientY)
    applyTransform()
    image.style.cursor = 'grab'
  }

  function handlePointerDown(e: PointerEvent) {
    if (scale <= 1) return
    e.preventDefault()
    dragging = true
    startX = e.clientX
    startY = e.clientY
    startTx = translateX
    startTy = translateY
    image.setPointerCapture(e.pointerId)
    image.style.cursor = 'grabbing'
    image.style.transition = 'none'
  }

  function handlePointerMove(e: PointerEvent) {
    if (!dragging) return
    translateX = startTx + (e.clientX - startX)
    translateY = startTy + (e.clientY - startY)
    applyTransform()
  }

  function handlePointerUp(e: PointerEvent) {
    if (!dragging) return
    dragging = false
    image.releasePointerCapture(e.pointerId)
    image.style.cursor = scale > 1 ? 'grab' : ''
    image.style.transition = ''
  }

  image.addEventListener('dblclick', handleDblClick)
  image.addEventListener('pointerdown', handlePointerDown)
  image.addEventListener('pointermove', handlePointerMove)
  image.addEventListener('pointerup', handlePointerUp)

  return () => {
    image.removeEventListener('dblclick', handleDblClick)
    image.removeEventListener('pointerdown', handlePointerDown)
    image.removeEventListener('pointermove', handlePointerMove)
    image.removeEventListener('pointerup', handlePointerUp)
    resetTransform()
  }
}
