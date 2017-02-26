import exposeContext from 'vuelayers/src/mixins/expose-context'
import { MAP_PROJECTION, createAttributions } from 'vuelayers/src/ol'

const props = {
  attributions: Array,
  projection: {
    type: String,
    default: MAP_PROJECTION
  },
  wrapX: {
    type: Boolean,
    default: true
  }
}

const methods = {
  /**
   * @return {ol.source.Source}
   * @protected
   */
  createSource () {
    throw new Error('Not implemented')
  },
  refresh () {
    this.source.changed()
  },
  context () {
    return {
      ...this.$parent.context(),
      source: this.source
    }
  }
}

const watch = {
  attributions (value) {
    this.source.setAttributions(createAttributions(value))
  },
  projection (value) {
    this.source.setProjection(value)
  }
}

export default {
  name: 'vl-source',
  mixins: [ exposeContext ],
  props,
  methods,
  watch,
  render: h => h('slot'),
  created () {
    /**
     * @type {ol.source.Source}
     * @protected
     */
    this.source = this.createSource()
  },
  mounted () {
    this.context().layer.setSource(this.source)
  },
  beforeDestroy () {
    this.context().layer.setSource(undefined)

    this.source = undefined
  }
}
