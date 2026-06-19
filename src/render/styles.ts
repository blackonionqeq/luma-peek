export const viewerStyles = `
.lp-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

.lp-overlay[data-open] {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.lp-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  touch-action: none;
}

.lp-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;
}

.lp-nav:hover {
  background: rgba(0, 0, 0, 0.7);
}

.lp-nav--prev {
  left: 16px;
}

.lp-nav--next {
  right: 16px;
}

.lp-nav[hidden] {
  display: none;
}

.lp-close {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;
}

.lp-close:hover {
  background: rgba(0, 0, 0, 0.7);
}

.lp-image {
  transition: transform 0.2s ease;
}
`
