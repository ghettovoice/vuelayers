<script type="text/babel">
  /**
   * Wrapper around ol.Feature.
   *
   * @todo Add property 'visible', like in layer. If visible = false -> set null style
   */
  import uuid from 'uuid/v4'
  import stubVNode from 'vl-mixins/stub-vnode'
  import vmBind from 'vl-mixins/vm-bind'
  import styleTarget from 'vl-components/style/target'
  import { warn } from 'vl-utils/debug'
  import { reduce, omit } from 'vl-utils/func'
  import { feature as featureHelper } from 'vl-ol'

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
      this.feature && this.feature.changed()
    },
    plain () {
      return this.feature && this.feature.plain(this.view.getProjection())
    },
    styleTarget () {
      return this.feature
    }
  }

  const watch = {
    id (value) {
      this.feature && this.feature.setId(value)
    },
    properties (value) {
      this.feature && this.feature.setProperties(featureHelper.cleanProperties(value))
    }
  }

  const { provide: styleTargetProvide } = styleTarget

  export default {
    name: 'vl-feature',
    mixins: [ vmBind, stubVNode, styleTarget ],
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
      return Object.defineProperties(Object.create(null), {
        ...reduce((all, value, key), {}, this::styleTargetProvide()),
        feature: {
          enumerable: true,
          get: () => this.feature
        }
      })
    },
    created () {
      this::createFeature()
    },
    mounted () {
      this.$nextTick(() => {
        if (this.source) {
          this.source.addFeature(this.feature)
          this.feature.set('layer', this.layer.get('id'))
        } else if (process.env.NODE_ENV !== 'production') {
          warn("Invalid usage of feature component, should have source component among it's ancestors")
        }
      })
    },
    destroyed () {
      this.$nextTick(() => {
        this.source && this.source.removeFeature(this.feature)
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
    this.feature = featureHelper.createFeature({
      id: this.id,
      properties: this.properties
    }, this.view.getProjection())

    this.bindSelfTo(this.feature)

    return this.feature
  }
</script>

<style>/* stub style  */</style>
