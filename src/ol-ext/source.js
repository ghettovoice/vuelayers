import Source from 'ol/source/Source'
import uuid from 'uuid/v4'
import Vue from 'vue'

export function getSourceId (source) {
  if (source instanceof Vue) {
    return source.id
  } else if (source instanceof Source) {
    return source.get('id')
  }

  throw new Error('Illegal source argument')
}

export function setSourceId (source, sourceId) {
  if (source instanceof Vue) {
    source.id = sourceId

    return source
  } else if (source instanceof Source) {
    source.set('id', sourceId)

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
