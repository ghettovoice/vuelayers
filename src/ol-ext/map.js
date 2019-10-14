import { PluggableMap } from 'ol'
import { hasProp } from '../util/minilo'

export function getMapId (map) {
  if (map instanceof PluggableMap) {
    return map.get('id')
  } else if (hasProp(map, 'id')) {
    return map.id
  }

  throw new Error('Illegal map argument')
}

export function setMapId (map, mapId) {
  if (map instanceof PluggableMap) {
    map.set('id', mapId)

    return map
  } else if (hasProp(map, 'id')) {
    map.id = mapId

    return map
  }

  throw new Error('Illegal map argument')
}

export function getMapDataProjection (map) {
  if (map instanceof PluggableMap) {
    return map.get('dataProjection')
  } else if (hasProp(map, 'id')) {
    return map.dataProjection
  }

  throw new Error('Illegal map argument')
}

export function setMapDataProjection (map, dataProjection) {
  if (map instanceof PluggableMap) {
    map.set('dataProjection', dataProjection)

    return map
  } else if (hasProp(map, 'id')) {
    map.dataProjection = dataProjection

    return map
  }

  throw new Error('Illegal map argument')
}
