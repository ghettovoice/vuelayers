import { PluggableMap } from 'ol'

export function getMapId (map) {
  if (map instanceof PluggableMap) {
    return map.get('id')
  }

  throw new Error('Illegal map argument')
}

export function setMapId (map, mapId) {
  if (map instanceof PluggableMap) {
    map.set('id', mapId)

    return map
  }

  throw new Error('Illegal map argument')
}

export function getMapDataProjection (map) {
  if (map instanceof PluggableMap) {
    return map.get('dataProjection')
  }

  throw new Error('Illegal map argument')
}

export function setMapDataProjection (map, dataProjection) {
  if (map instanceof PluggableMap) {
    map.set('dataProjection', dataProjection)

    return map
  }

  throw new Error('Illegal map argument')
}
