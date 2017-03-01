import ol from 'openlayers'
import exposeInject from 'vuelayers/src/mixins/expose-inject'
import rxSubs from 'vuelayers/src/mixins/rx-subs'

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
  },
  getExtent () {
    return this.geometry.getExtent()
  },
  setCoordinates (coordinates) {
    this.geometry.setCoordinates(ol.proj.fromLonLat(coordinates, this.view.getProjection()))
  },
  getCoordinates () {
    return ol.proj.toLonLat(this.geometry.getCoordinates(), this.view.getProjection())
  }
}

const watch = {
  coordinates: {
    deep: true,
    handler (value) {
      this.setCoordinates(value)
    }
  }
}

export default {
  mixins: [ exposeInject, rxSubs ],
  inject: [ 'feature', 'view' ],
  props,
  watch,
  methods,
  render: h => h(),
  created () {
    /**
     * @type {ol.geom.SimpleGeometry}
     * @protected
     */
    this.geometry = this.createGeometry()
    this.geometry.vm = this
  },
  mounted () {
    this.feature.setGeometry(this.geometry)

    if (process.env.NODE_ENV !== 'production') {
      console.log('mount geom', this)
    }
  },
  beforeDestroy () {
    this.feature.setGeometry(undefined)

    if (process.env.NODE_ENV !== 'production') {
      console.log('unmount geom', this)
    }
  },
  destroyed () {
    this.geometry = undefined
  }
}
