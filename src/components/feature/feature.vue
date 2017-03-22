<script type="text/babel">
  /**
   * Wrapper around ol.Feature.
   */
  import uuid from 'uuid/v4'
  import stubVNode from 'vl-mixins/stub-vnode'
  import styleTarget from 'vl-components/style/target'
  import { warn } from 'vl-utils/debug'
  import { read, cleanProperties } from 'vl-ol/geojson'
  import { LAYER_PROP } from 'vl-ol/consts'

  const props = {
    id: {
      type: [ String, Number ],
      default: () => uuid()
    },
    properties: {
      type: Object,
      default: () => Object.create(null)
    }
  }

  const methods = {
    refresh () {
      this.feature.changed()
    },
    styleTarget () {
      return this.feature
    },
    mountFeature () {
      if (this.source) {
        this.source.addFeature(this.feature)
        this.feature.set(LAYER_PROP, this.layer.get('id'))
      } else if (process.env.NODE_ENV !== 'production') {
        warn("Invalid usage of feature component, should have source component among it's ancestors")
      }
    },
    unmountFeature () {
      if (this.source && this.source.getFeatureById(this.id)) {
        this.source.removeFeature(this.feature)
        this.feature.unset(LAYER_PROP)
      }
    }
  }

  const watch = {
    id (value) {
      this.feature.setId(value)
    },
    properties (value) {
      this.feature.setProperties(cleanProperties(value))
    }
  }

  const { provide: styleTargetProvide } = styleTarget

  export default {
    name: 'vl-feature',
    mixins: [ stubVNode, styleTarget ],
    inject: [ 'layer', 'source', 'view' ],
    props,
    methods,
    watch,
    stubVNode: {
      attrs () {
        return {
          id: [ this.$options.name, this.id ].join('-')
        }
      }
    },
    provide () {
      return Object.assign(
        Object.defineProperties(Object.create(null), {
          feature: {
            enumerable: true,
            get: () => this.feature
          }
        }),
        this::styleTargetProvide()
      )
    },
    created () {
      this::createFeature()
    },
    mounted () {
      this.$nextTick(this.mountFeature)
    },
    destroyed () {
      this.$nextTick(() => {
        this.unmountFeature()
        this.feature = undefined
      })
    }
  }

  /**
   * Create feature without inner style applying, feature level style
   * will be applied in the layer level style function.
   *
   * @return {ol.Feature}
   */
  function createFeature () {
    /**
     * @type {ol.Feature}
     * @protected
     */
    this.feature = read({
      id: this.id,
      properties: this.properties
    }, this.view.getProjection())
    this.feature.set('vm', this)

    return this.feature
  }
</script>

<style>/* stub style */</style>
