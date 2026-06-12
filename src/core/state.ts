export interface ImageItem {
  src: string
  alt?: string
}

export interface ViewerState {
  isOpen: boolean
  items: ImageItem[]
  currentIndex: number
}

export function createState(): ViewerState {
  return {
    isOpen: false,
    items: [],
    currentIndex: 0,
  }
}
