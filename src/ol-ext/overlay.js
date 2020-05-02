import { Overlay } from 'ol'
import { v4 as uuid } from 'uuid'

export function getOverlayId (overlay) {
  if (overlay instanceof Overlay) {
    return overlay.get('id')
  }

  throw new Error('Illegal overlay argument')
}

export function setOverlayId (overlay, overlayId) {
  if (overlay instanceof Overlay) {
    overlay.set('id', overlayId)

    return overlay
  }

  throw new Error('Illegal overlay argument')
}

export function initializeOverlay (overlay, defaultOverlay) {
  if (getOverlayId(overlay) == null) {
    setOverlayId(overlay, defaultOverlay || uuid())
  }

  return overlay
}
