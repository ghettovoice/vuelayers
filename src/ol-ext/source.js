import { Source } from 'ol/source'
import uuid from 'uuid/v4'
import { hasProp } from '../util/minilo'

export function getSourceId (source) {
  if (source instanceof Source) {
    return source.get('id')
  } else if (hasProp(source, 'id')) {
    return source.id
  }

  throw new Error('Illegal source argument')
}

export function setSourceId (source, sourceId) {
  if (source instanceof Source) {
    source.set('id', sourceId)

    return source
  } else if (hasProp(source, 'id')) {
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
