import ol from 'openlayers'
import exposeInject from 'vuelayers/src/mixins/expose-inject'
import rxSubs from 'vuelayers/src/mixins/rx-subs'

const props = {
  coordinates: {
    type: Array,
    required: true,
    validator: value => Array.isArray(value) && value.length
  },
  layout: {
    type: String,
    default: ol.geom.GeometryLayout.XY
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
  }
  // todo export other ol.geom.SimpleGeometry methods
}

const watch = {
  coordinates: {
    deep: true,
    handler (value) {
      this.geometry.setCoordinates(value)
    }
  }
}

export default {
  mixins: [ exposeInject, rxSubs ],
  inject: [ 'feature' ],
  props,
  watch,
  methods,
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
  },
  beforeDestroy () {
    this.feature.setGeometry(undefined)
  },
  destroyed () {
    this.geometry = undefined
  }
}
