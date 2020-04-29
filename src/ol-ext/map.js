import Vue from 'vue'
import { PluggableMap } from 'ol'

export function getMapId (map) {
  if (map instanceof PluggableMap) {
    return map.get('id')
  } else if (map instanceof Vue) {
    return map.id
  }

  throw new Error('Illegal map argument')
}

export function setMapId (map, mapId) {
  if (map instanceof PluggableMap) {
    map.set('id', mapId)

    return map
  } else if (map instanceof Vue) {
    map.id = mapId

    return map
  }

  throw new Error('Illegal map argument')
}

export function getMapDataProjection (map) {
  if (map instanceof PluggableMap) {
    return map.get('dataProjection')
  } else if (map instanceof Vue) {
    return map.dataProjection
  }

  throw new Error('Illegal map argument')
}

export function setMapDataProjection (map, dataProjection) {
  if (map instanceof PluggableMap) {
    map.set('dataProjection', dataProjection)

    return map
  } else if (map instanceof Vue) {
    map.dataProjection = dataProjection

    return map
  }

  throw new Error('Illegal map argument')
}
