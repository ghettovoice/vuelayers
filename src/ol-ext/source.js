import { Source } from 'ol/source'
import { v4 as uuid } from 'uuid'
import { reduce } from '../util/minilo'

export function getSourceId (source) {
  if (source instanceof Source) {
    return source.get('id')
  }

  throw new Error('Illegal source argument')
}

export function setSourceId (source, sourceId) {
  if (source instanceof Source) {
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

export function cleanSourceParams (params, filterKeys) {
  return reduce(params, (params, value, key) => {
    key = key.toUpperCase()
    if (filterKeys.includes(key)) {
      return params
    }

    params[key] = value

    return params
  }, {})
}
