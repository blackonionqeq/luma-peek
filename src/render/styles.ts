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
  transition: opacity 0.2s ease;
}

.lp-overlay[data-open] {
  opacity: 1;
}

.lp-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
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
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;
}

.lp-nav:hover {
  background: rgba(255, 255, 255, 0.25);
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
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;
}

.lp-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.lp-image {
  transition: transform 0.2s ease;
}
`
