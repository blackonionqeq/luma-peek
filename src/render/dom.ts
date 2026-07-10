import { chevronLeft, chevronRight, closeIcon, zoomInIcon, zoomOutIcon } from './icons'
import { viewerStyles } from './styles'

export interface ViewerElements {
  overlay: HTMLElement
  image: HTMLImageElement
  prevBtn: HTMLButtonElement
  nextBtn: HTMLButtonElement
  closeBtn: HTMLButtonElement
  zoomInBtn: HTMLButtonElement
  zoomOutBtn: HTMLButtonElement
}

export function createDOM(container: HTMLElement | ShadowRoot): ViewerElements {
  const style = document.createElement('style')
  style.textContent = viewerStyles
  container.appendChild(style)

  const overlay = document.createElement('div')
  overlay.className = 'lp-overlay'

  const image = document.createElement('img')
  image.className = 'lp-image'

  const prevBtn = document.createElement('button')
  prevBtn.className = 'lp-nav lp-nav--prev'
  prevBtn.innerHTML = chevronLeft
  prevBtn.setAttribute('aria-label', 'Previous image')

  const nextBtn = document.createElement('button')
  nextBtn.className = 'lp-nav lp-nav--next'
  nextBtn.innerHTML = chevronRight
  nextBtn.setAttribute('aria-label', 'Next image')

  const closeBtn = document.createElement('button')
  closeBtn.className = 'lp-close'
  closeBtn.innerHTML = closeIcon
  closeBtn.setAttribute('aria-label', 'Close viewer')

  const zoomInBtn = document.createElement('button')
  zoomInBtn.className = 'lp-zoom lp-zoom--in'
  zoomInBtn.innerHTML = zoomInIcon
  zoomInBtn.setAttribute('aria-label', 'Zoom in')

  const zoomOutBtn = document.createElement('button')
  zoomOutBtn.className = 'lp-zoom lp-zoom--out'
  zoomOutBtn.innerHTML = zoomOutIcon
  zoomOutBtn.setAttribute('aria-label', 'Zoom out')

  overlay.appendChild(image)
  overlay.appendChild(prevBtn)
  overlay.appendChild(nextBtn)
  overlay.appendChild(zoomOutBtn)
  overlay.appendChild(zoomInBtn)
  overlay.appendChild(closeBtn)
  container.appendChild(overlay)

  return { overlay, image, prevBtn, nextBtn, closeBtn, zoomInBtn, zoomOutBtn }
}

export function destroyDOM(container: HTMLElement | ShadowRoot): void {
  container.replaceChildren()
}
