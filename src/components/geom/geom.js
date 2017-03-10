// import { isEqual } from 'vl-utils/func'
// import Observable from 'vl-rx'
import rxSubs from 'vl-mixins/rx-subs'
import vmBind from 'vl-mixins/vm-bind'
import stubVNode from 'vl-mixins/stub-vnode'
import { coord as coordHelper } from 'vl-ol'
import { warn } from 'vl-utils/debug'

const props = {
  /**
   * Coordinates in EPSG:4326
   */
  coordinates: {
    type: Array,
    required: true,
    validator: value => Array.isArray(value) && value.length
  }
}

const computed = {
  type () {
    return this.geometry.getType()
  }
}

const methods = {
  /**
   * @protected
   */
  initialize () {
    /**
     * @type {ol.geom.SimpleGeometry}
     * @protected
     */
    this.geometry = this.createGeometry()
    this.bindSelfTo(this.geometry)
    /**
     * @protected
     */
    this.coordTransform = coordHelper.coordTransform[ this.geometry.getType() ]

    this.currentCoordinates = this.coordTransform.toLonLat(this.geometry.getCoordinates(), this.view.getProjection())
    this.currentExtent = coordHelper.extentToLonLat(this.geometry.getExtent(), this.view.getProjection())
  },
  /**
   * @return {ol.geom.SimpleGeometry}
   * @protected
   */
  createGeometry () {
    throw new Error('Not implemented method')
  },
  subscribeAll () {
    // this::subscribeToGeomChanges()
  },
  /**
   * @protected
   */
  mountGeometry () {
    if (this.feature) {
      this.feature.setGeometry(this.geometry)
      this.subscribeAll()
    } else if (process.env.NODE_ENV !== 'production') {
      warn("Invalid usage of geometry component, should have feature component among it's ancestors")
    }
  },
  /**
   * @protected
   */
  unmountGeometry () {
    this.unsubscribeAll()
    this.feature && this.feature.setGeometry(undefined)
  },
  refresh () {
    this.geometry && this.geometry.changed()
  }
}
// todo use turf.js to optimize geometry compare
const watch = {
  coordinates (value) {
    // this.geometry.setCoordinates(this.coordTransform.fromLonLat(value, this.view.getProjection()))
  }
}

export default {
  mixins: [ rxSubs, vmBind, stubVNode ],
  inject: [ 'view', 'feature' ],
  props,
  computed,
  watch,
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  },
  provide () {
    return Object.defineProperties(Object.create(null), {
      geometry: {
        enumerable: true,
        get: () => this.geometry
      }
    })
  },
  data () {
    return {
      currentCoordinates: this.coordinates.slice(),
      currentExtent: []
    }
  },
  created () {
    this.initialize()
  },
  mounted () {
    this.$nextTick(this.mountGeometry)
  },
  destroyed () {
    this.$nextTick(() => {
      this.unmountGeometry()
      this.geometry = undefined
    })
  }
}

// function subscribeToGeomChanges () {
//   this.rxSubs.geomChanges = Observable.fromOlEvent(this.geometry, 'change')
//     .throttleTime(1000)
//     .map(() => {
//       return [
//         this.coordTransform.toLonLat(this.geometry.getCoordinates(), this.view.getProjection()),
//         coordHelper.extentToLonLat(this.geometry.getExtent(), this.view.getProjection())
//       ]
//     })
//     .distinctUntilChanged((a, b) => isEqual(a, b))
//     .subscribe(
//       ([ coordinates, extent ]) => {
//         this.currentCoordinates = coordinates
//         this.currentExtent = extent
//         this.$emit('change', { coordinates, extent })
//       },
//       ::console.error
//     )
// }
