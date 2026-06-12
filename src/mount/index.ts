export interface MountResult {
  host: HTMLElement
  container: HTMLElement | ShadowRoot
}

export function mount(shadow: boolean): MountResult {
  const host = document.createElement('div')
  host.setAttribute('data-luma-peek', '')
  document.body.appendChild(host)

  const container = shadow ? host.attachShadow({ mode: 'open' }) : host

  return { host, container }
}

export function unmount(host: HTMLElement): void {
  host.remove()
}
