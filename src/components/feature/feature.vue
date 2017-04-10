<script type="text/babel">
  /**
   * Wrapper around ol.Feature.
   */
  import uuid from 'uuid/v4'
  import Observable from '../../rx'
  import rxSubs from '../../mixins/rx-subs'
  import stubVNode from '../../mixins/stub-vnode'
  import plainProps from '../../utils/plain-props'
  import styleTarget from '../style-target'
  import { consts, coordinateHelper, geoJson } from '../../ol'

  const { LAYER_PROP } = consts
  const { toLonLat } = coordinateHelper

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
      if (!this.source) {
        throw new Error("Invalid usage of feature component, should have source component among it's ancestors")
      }

      this.source.addFeature(this.feature)
      this.feature.set(LAYER_PROP, this.layer.get('id'))
      this.subscribeAll()
    },
    unmountFeature () {
      this.unsubscribeAll()
      if (this.source && this.source.getFeatureById(this.id)) {
        this.source.removeFeature(this.feature)
        this.feature.unset(LAYER_PROP)
      }
    },
    subscribeAll () {
      this::subscribeToMapEvents()
    },
    isAtPixel (pixel) {
      return this.map.forEachFeatureAtPixel(
        pixel,
        feature => feature === this.feature,
        {
          layerFilter: layer => layer === this.layer
        }
      )
    }
  }

  const watch = {
    id (value) {
      this.feature.setId(value)
    },
    properties (value) {
      this.feature.setProperties(plainProps(value))
    }
  }

  const { provide: styleTargetProvide } = styleTarget

  export default {
    name: 'vl-feature',
    mixins: [ rxSubs, stubVNode, styleTarget ],
    inject: [ 'map', 'view', 'layer', 'source' ],
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
    this.feature = geoJson.readFeature({
      id: this.id,
      properties: this.properties
    }, this.view.getProjection())
    this.feature.set('vm', this)

    return this.feature
  }

  function subscribeToMapEvents () {
    const pointerEvents = Observable.fromOlEvent(
      this.map,
      [ 'click', 'dblclick', 'singleclick' ],
      ({ type, pixel, coordinate }) => ({ type, pixel, coordinate })
    ).map(evt => ({
      ...evt,
      coordinate: toLonLat(evt.coordinate, this.view.getProjection())
    }))

    this.subscribeTo(pointerEvents, evt => {
      if (this.isAtPixel(evt.pixel)) {
        this.$emit(evt.type, evt)
      }
    })
  }
</script>
