import { Source } from 'ol/source'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'

export function getSourceId (source) {
  if (source instanceof Source) {
    return source.get('id')
  } else if (source instanceof Vue) {
    return source.id
  }

  throw new Error('Illegal source argument')
}

export function setSourceId (source, sourceId) {
  if (source instanceof Source) {
    source.set('id', sourceId)

    return source
  } else if (source instanceof Vue) {
    source.id = sourceId

    return source
  }

  throw new Error('Illegal source argument')
}

export function initializeSource (source, defaultSourceId) {
  if (getSourceId(source) == null) {
    setSourceId(source, defaultSourceId || uuid())
  }

  return source
}
