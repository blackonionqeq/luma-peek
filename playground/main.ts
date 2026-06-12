import { createViewer } from '../src'

const viewer = createViewer({ shadow: false })

document.querySelector('.img')!.addEventListener('click', () => {
  viewer.open({
    items: [
      { src: 'https://picsum.photos/id/10/1200/800', alt: 'Forest' },
      { src: 'https://picsum.photos/id/20/1200/800', alt: 'Bird' },
      { src: 'https://picsum.photos/id/30/1200/800', alt: 'Plant' },
    ],
  })
})

viewer.on('open', () => console.log('[luma-peek] opened'))
viewer.on('close', () => console.log('[luma-peek] closed'))
