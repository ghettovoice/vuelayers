// import { isEqual } from 'vl-utils/func'
// import Observable from 'vl-rx'
// import { Observable } from 'rxjs/Observable'
// import 'rxjs/add/observable/combineLatest'
// import 'rxjs/add/operator/throttleTime'
// import 'rxjs/add/operator/distinctUntilChanged'
// import 'rxjs/add/operator/map'
// import 'vl-rx'
import { partialRight } from 'lodash/fp'
import rxSubs from 'vl-mixins/rx-subs'
import vmBind from 'vl-mixins/vm-bind'
import stubVNode from 'vl-mixins/stub-vnode'
import { coordinateHelper, extentHelper } from 'vl-ol'
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
    throw new Error('Not implemented computed property')
  }
}

const methods = {
  /**
   * @protected
   */
  initialize () {
    // define helper methods based on geometry type
    const { toLonLat, fromLonLat } = coordinateHelper.transforms[ this.type ]
    /**
     * @param {Array} coordinates
     * @returns {Array}
     * @protected
     */
    this.toLonLat = coordinates => toLonLat(coordinates, this.view.getProjection())
    /**
     * @param {Array} coordinates
     * @param {Array}
     * @protected
     */
    this.fromLonLat = coordinates => fromLonLat(coordinates, this.view.getProjection())
    /**
     * @param {Array} extent
     * @returns {Array}
     * @protected
     */
    this.extentToLonLat = extent => extentHelper.toLonLat(extent, this.view.getProjection())
    /**
     * @type {SimpleGeometry}
     * @protected
     */
    this.geometry = this.createGeometry()
    this.bindSelfTo(this.geometry)

    this.currentExtent = this.extentToLonLat(this.geometry.getExtent())
  },
  /**
   * @return {SimpleGeometry}
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
    this.geometry.changed()
  }
}
// todo use turf.js to optimize geometry compare
const watch = {
  coordinates (value) {
    // this.geometry.setCoordinates(this.fromLonLat(value, this.view.getProjection()))
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
//   this.subscribeTo(
//     Observable.fromOlEvent(this.geometry, 'change')
//     .throttleTime(1000)
//     .map(() => {
//       return [
//         this.toLonLat(this.geometry.getCoordinates(), this.view.getProjection()),
//         extentHelper.toLonLat(this.geometry.getExtent(), this.view.getProjection())
//       ]
//     })
//     .distinctUntilChanged((a, b) => isEqual(a, b)),
//       ([ coordinates, extent ]) => {
//         this.currentCoordinates = coordinates
//         this.currentExtent = extent
//         this.$emit('change', { coordinates, extent })
//       }
//     )
// }
