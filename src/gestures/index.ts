export function attachGestures(_container: HTMLElement, image: HTMLElement): () => void {
  let scale = 1
  let translateX = 0
  let translateY = 0

  function applyTransform() {
    image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
  }

  function resetTransform() {
    scale = 1
    translateX = 0
    translateY = 0
    image.style.transform = ''
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
  }

  image.addEventListener('dblclick', handleDblClick)

  return () => {
    image.removeEventListener('dblclick', handleDblClick)
    resetTransform()
  }
}
