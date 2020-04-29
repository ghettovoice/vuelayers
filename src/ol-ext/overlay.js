import { Overlay } from 'ol'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'

export function getOverlayId (overlay) {
  if (overlay instanceof Overlay) {
    return overlay.get('id')
  } else if (overlay instanceof Vue) {
    return overlay.id
  }

  throw new Error('Illegal overlay argument')
}

export function setOverlayId (overlay, overlayId) {
  if (overlay instanceof Overlay) {
    overlay.set('id', overlayId)

    return overlay
  } else if (overlay instanceof Vue) {
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
