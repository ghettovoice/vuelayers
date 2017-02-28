import ol from 'openlayers'
import exposeInject from 'vuelayers/src/mixins/expose-inject'
import rxSubs from 'vuelayers/src/mixins/rx-subs'

const props = {
  coordinates: {
    type: Array,
    required: true
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
  name: 'vl-geom',
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
  updated () {
    this.geometry.changed()
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
