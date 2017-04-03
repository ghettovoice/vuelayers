<script>
  import Vue from 'vue'
  import View from 'ol/view'
  import { isEqual } from 'lodash/fp'
  import Observable from '../../rx'
  import { consts, coordinateHelper } from '../../ol'
  import { warn } from '../../utils/debug'
  import rxSubs from '../../mixins/rx-subs'
  import stubVNode from '../../mixins/stub-vnode'

  const { MIN_ZOOM, MAX_ZOOM, MAP_PROJECTION, ZOOM_FACTOR } = consts
  const { toLonLat, fromLonLat } = coordinateHelper

  const props = {
    zoom: {
      type: Number,
      default: MIN_ZOOM
    },
    center: {
      type: Array,
      default: () => [ 0, 0 ],
      validator: value => Array.isArray(value) && value.length === 2
    },
    rotation: {
      type: Number,
      default: 0
    },
    maxZoom: {
      type: Number,
      default: MAX_ZOOM
    },
    minZoom: {
      type: Number,
      default: MIN_ZOOM
    },
    projection: {
      type: String,
      default: MAP_PROJECTION
    },
    enableRotation: {
      type: Boolean,
      default: true
    },
    extent: {
      type: Array,
      validator: value => Array.isArray(value) && value.length === 4
    },
    maxResolution: Number,
    minResolution: Number,
    resolution: Array,
    zoomFactor: {
      type: Number,
      default: ZOOM_FACTOR
    }
  }

  const methods = {
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#fit}
     */
    fit (geometryOrExtent, options) {
      this.view.fit(geometryOrExtent, options)
    },
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#animate}
     * @param {...Object} args
     * @return {Promise}
     */
    animate (...args) {
      let cb = args.reverse().find(x => typeof x === 'function')

      return new Promise(
        resolve => this.view.animate(...args, complete => {
          cb && cb(complete)
          resolve(complete)
        })
      )
    },
    refresh () {
      this.view.changed()
    },
    setCurrentView ({ center, zoom, rotation }) {
      if (center != null && !isEqual(center, this.currentCenter)) {
        this.view.setCenter(fromLonLat(center, this.projection))
      }
      if (zoom != null && zoom !== this.currentZoom) {
        this.view.setZoom(zoom)
      }
      if (rotation != null && rotation !== this.currentRotation) {
        this.view.setRotation(rotation)
      }
    },
    subscribeAll () {
      this::subscribeToViewChanges()
    },
    mountView () {
      if (!this.map) {
        throw new Error("Invalid usage of view component, should have map component among it's ancestors")
      }

      let view = this.map.getView()

      if (view && view.get('vm') instanceof Vue) {
        if (process.env.NODE_ENV !== 'production') {
          warn('Map already has mounted vl-view component. ' +
               'It will be replaced with new.')
        }
        view.get('vm').unmountView()
      }

      this.map.setView(this.view)
      this.subscribeAll()
    },
    unmountView () {
      this.unsubscribeAll()
      this.map && this.map.setView(undefined)
    }
  }
  // todo watch other props
  const watch = {
    center (center) {
      this.setCurrentView({ center })
    },
    zoom (zoom) {
      this.setCurrentView({ zoom })
    },
    rotation (rotation) {
      this.setCurrentView({ rotation })
    }
  }

  export default {
    name: 'vl-view',
    inject: [ 'map' ],
    mixins: [ rxSubs, stubVNode ],
    props,
    methods,
    watch,
    stubVNode: {
      empty () {
        return this.$options.name
      }
    },
    data () {
      return {
        currentZoom: this.zoom,
        currentCenter: this.center.slice(),
        currentRotation: this.rotation
      }
    },
    created () {
      this::createView()
    },
    mounted () {
      this.$nextTick(this.mountView)
    },
    destroyed () {
      this.$nextTick(() => {
        this.unmountView()
        this.view = undefined
      })
    }
  }

  /**
   * @return {View}
   */
  function createView () {
    /**
     * @type {View}
     * @protected
     */
    this.view = new View({
      center: fromLonLat(this.currentCenter, this.projection),
      zoom: this.currentZoom,
      maxZoom: this.maxZoom,
      minZoom: this.minZoom,
      projection: this.projection
    })
    this.view.set('vm', this)

    return this.view
  }

  /**
   * Subscribe to OpenLayers significant events
   */
  function subscribeToViewChanges () {
    const centerChanges = Observable.of(this.view.getCenter())
      .merge(
        Observable.fromOlEvent(
          this.view,
          'change:center',
          () => this.view.getCenter()
        )
      )
    const resolutionChanges = Observable.of(this.view.getZoom())
      .merge(
        Observable.fromOlEvent(
          this.view,
          'change:resolution',
          () => this.view.getZoom()
        )
      )
    const rotationChanges = Observable.of(this.view.getRotation())
      .merge(
        Observable.fromOlEvent(
          this.view,
          'change:rotation',
          () => this.view.getRotation()
        )
      )

    const viewChanges = Observable.combineLatest(
      centerChanges,
      resolutionChanges,
      rotationChanges
    ).throttleTime(300)
      .distinctUntilChanged((a, b) => isEqual(a, b))
      .map(([ center, zoom, rotation ]) => {
        return {
          center: toLonLat(center, this.projection),
          zoom: Math.ceil(this.view.getZoom()),
          rotation
        }
      })

    this.subscribeTo(
      viewChanges,
      ({ center, zoom, rotation }) => {
        let changed = false
        if (!isEqual(this.currentCenter, center)) {
          this.currentCenter = center
          changed = true
        }
        if (this.currentZoom !== zoom) {
          this.currentZoom = zoom
          changed = true
        }
        if (this.currentRotation !== rotation) {
          this.currentRotation = rotation
          changed = true
        }

        changed && this.$emit('change', { center, zoom, rotation })
      }
    )
  }
</script>
