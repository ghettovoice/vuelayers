import { pick } from '../../util/minilo'
import CircleGeom from './circle-geom.vue'
import Feature from './feature.vue'
import LineStringGeom from './line-string-geom.vue'
import MultiLineStringGeom from './multi-line-string-geom.vue'
import MultiPointGeom from './multi-point-geom.vue'
import MultiPolygonGeom from './multi-polygon-geom.vue'
import PointGeom from './point-geom.vue'
import PolygonGeom from './polygon-geom.vue'

function plugin (Vue, options = {}) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  options = pick(options, 'dataProjection')
  Object.assign(Feature, options)
  Object.assign(CircleGeom, options)
  Object.assign(PointGeom, options)
  Object.assign(LineStringGeom, options)
  Object.assign(PolygonGeom, options)
  Object.assign(MultiPointGeom, options)
  Object.assign(MultiLineStringGeom, options)
  Object.assign(MultiPolygonGeom, options)

  Vue.component(Feature.name, Feature)
  Vue.component(CircleGeom.name, CircleGeom)
  Vue.component(PointGeom.name, PointGeom)
  Vue.component(LineStringGeom.name, LineStringGeom)
  Vue.component(PolygonGeom.name, PolygonGeom)
  Vue.component(MultiPointGeom.name, MultiPointGeom)
  Vue.component(MultiLineStringGeom.name, MultiLineStringGeom)
  Vue.component(MultiPolygonGeom.name, MultiPolygonGeom)
}

export default plugin

export {
  plugin as install,
  Feature,
  CircleGeom,
  PointGeom,
  LineStringGeom,
  PolygonGeom,
  MultiPointGeom,
  MultiLineStringGeom,
  MultiPolygonGeom,
}
