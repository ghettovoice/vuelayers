import { Overlay } from 'ol'
import { v4 as uuid } from 'uuid'
import { hasProp } from '../util/minilo'

export function getOverlayId (overlay) {
  if (overlay instanceof Overlay) {
    return overlay.get('id')
  } else if (hasProp(overlay, 'id')) {
    return overlay.id
  }

  throw new Error('Illegal overlay argument')
}

export function setOverlayId (overlay, overlayId) {
  if (overlay instanceof Overlay) {
    overlay.set('id', overlayId)

    return overlay
  } else if (hasProp(overlay, 'id')) {
    overlay.id = overlayId

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
