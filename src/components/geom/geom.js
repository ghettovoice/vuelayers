// import { isEqual } from 'lodash/fp'
// import { Observable } from 'rxjs/Observable'
// import 'rxjs/add/observable/combineLatest'
// import 'rxjs/add/operator/throttleTime'
// import 'rxjs/add/operator/distinctUntilChanged'
// import 'rxjs/add/operator/map'
// import 'vl-rx/from-ol-event'
import rxSubs from '../../mixins/rx-subs'
import stubVNode from '../../mixins/stub-vnode'
import { coordinateHelper, extentHelper } from '../../ol'

const { transforms } = coordinateHelper
const { toLonLat: extentToLonLat } = extentHelper

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
    const { toLonLat, fromLonLat } = transforms[ this.type ]
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
    this.extentToLonLat = extent => extentToLonLat(extent, this.view.getProjection())
    /**
     * @type {SimpleGeometry}
     * @protected
     */
    this.geometry = this.createGeometry()
    this.geometry.set('vm', this)
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
    if (!this.feature) {
      throw new Error("Invalid usage of geometry component, should have feature component among it's ancestors")
    }

    this.feature.setGeometry(this.geometry)
    this.subscribeAll()
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
  mixins: [ rxSubs, stubVNode ],
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
