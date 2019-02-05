import PluggableMap from 'ol/PluggableMap'
import Vue from 'vue'

export function getMapDataProjection (map) {
  if (map instanceof Vue) {
    return map.dataProjection
  } else if (map instanceof PluggableMap) {
    return map.get('dataProjection')
  }

  throw new Error('Illegal map argument')
}

export function setMapDataProjection (map, dataProjection) {
  if (map instanceof Vue) {
    map.dataProjection = dataProjection

    return map
  } else if (map instanceof PluggableMap) {
    map.set('dataProjection', dataProjection)

    return map
  }

  throw new Error('Illegal map argument')
}
