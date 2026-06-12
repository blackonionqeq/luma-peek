import { chevronLeft, chevronRight, closeIcon } from './icons'
import { viewerStyles } from './styles'

export interface ViewerElements {
  overlay: HTMLElement
  image: HTMLImageElement
  prevBtn: HTMLButtonElement
  nextBtn: HTMLButtonElement
  closeBtn: HTMLButtonElement
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

  overlay.appendChild(image)
  overlay.appendChild(prevBtn)
  overlay.appendChild(nextBtn)
  overlay.appendChild(closeBtn)
  container.appendChild(overlay)

  return { overlay, image, prevBtn, nextBtn, closeBtn }
}

export function destroyDOM(container: HTMLElement | ShadowRoot): void {
  container.replaceChildren()
}
