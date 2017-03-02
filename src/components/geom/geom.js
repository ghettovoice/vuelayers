import { isEqual } from 'lodash/fp'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/throttleTime'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/map'
import 'vl-rx'
import exposeInject from 'vl-mixins/expose-inject'
import rxSubs from 'vl-mixins/rx-subs'
import { coord as coordHelper } from 'vl-ol'

const props = {
  /**
   * Coordinates in EPSG:4326
   */
  coordinates: {
    type: Array,
    required: true,
    validator: value => Array.isArray(value) && value.length
  },
  layout: {
    type: String,
    default: 'XY'
  }
}

const computed = {
  type () {
    return this.geometry.getType()
  }
}

const methods = {
  /**
   * @return {ol.geom.SimpleGeometry}
   * @protected
   */
  createGeometry () {
    throw new Error('Not implemented method')
  },
  refresh () {
    this.geometry.changed()
  },
  expose () {
    return {
      ...this.$parent.expose(),
      geometry: this.geometry
    }
  }
}

const watch = {
  coordinates: {
    deep: true,
    handler (value) {
      this.geometry.setCoordinates(this.coordTransform.fromLonLat(value, this.view.getProjection()))
    }
  }
}

export default {
  mixins: [ exposeInject, rxSubs ],
  inject: [ 'feature', 'view' ],
  props,
  computed,
  watch,
  methods,
  render: h => h(),
  data () {
    return {
      currentCoordinates: this.coordinates,
      currentExtent: []
    }
  },
  created () {
    /**
     * @type {ol.geom.SimpleGeometry}
     * @protected
     */
    this.geometry = this.createGeometry()
    this.geometry.vm = this
    /**
     * @protected
     */
    this.coordTransform = coordHelper.coordTransform[ this.geometry.getType() ]

    this.currentCoordinates = this.coordTransform.toLonLat(this.geometry.getCoordinates(), this.view.getProjection())
    this.currentExtent = coordHelper.extentToLonLat(this.geometry.getExtent(), this.view.getProjection())

    this::subscribeToGeomChanges()
  },
  mounted () {
    this.feature.setGeometry(this.geometry)
  },
  beforeDestroy () {
    this.feature.setGeometry(undefined)
  },
  destroyed () {
    this.geometry = undefined
  }
}

function subscribeToGeomChanges () {
  this.rxSubs.geomChanges = Observable.fromOlEvent(this.geometry, 'change')
    .throttleTime(100)
    .map(() => {
      return [
        this.coordTransform.toLonLat(this.geometry.getCoordinates(), this.view.getProjection()),
        coordHelper.extentToLonLat(this.geometry.getExtent(), this.view.getProjection())
      ]
    })
    .distinctUntilChanged((a, b) => isEqual(a, b))
    .subscribe(
      ([ coordinates, extent ]) => {
        this.currentCoordinates = coordinates
        this.currentExtent = extent
        this.$emit('change', { coordinates, extent })
      },
      ::console.error
    )
}
