import BaseLayer from 'ol/layer/Base'
import { v4 as uuid } from 'uuid'

export function getLayerId (layer) {
  if (layer instanceof BaseLayer) {
    return layer.get('id')
  }

  throw new Error('Illegal layer argument')
}

export function setLayerId (layer, layerId) {
  if (layer instanceof BaseLayer) {
    layer.set('id', layerId)

    return layer
  }

  throw new Error('Illegal layer argument')
}

export function initializeLayer (layer, defaultLayerId) {
  if (getLayerId(layer) == null) {
    setLayerId(layer, defaultLayerId || uuid())
  }

  return layer
}
