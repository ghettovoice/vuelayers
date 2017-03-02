<script>
  import ol from 'openlayers'
  import { isFunction, isEqual } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/combineLatest'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/throttleTime'
  import 'rxjs/add/operator/map'
  import 'vl-rx'
  import { errordbg, warn } from 'vl-utils/debug'
  import rxSubs from 'vl-mixins/rx-subs'
  import { consts as olConsts } from 'vl-ol'

  const props = {
    zoom: {
      type: Number,
      default: olConsts.MIN_ZOOM
    },
    center: {
      type: Array,
      default: () => ([ 0, 0 ]),
      validator: value => value.length === 2
    },
    rotation: {
      type: Number,
      default: 0
    },
    maxZoom: {
      type: Number,
      default: olConsts.MAX_ZOOM
    },
    minZoom: {
      type: Number,
      default: olConsts.MIN_ZOOM
    },
    projection: {
      type: String,
      default: olConsts.MAP_PROJECTION
    },
    enableRotation: {
      type: Boolean,
      default: true
    },
    extent: {
      type: Array,
      validator: value => value.length === 4
    },
    maxResolution: Number,
    minResolution: Number,
    resolution: Array,
    zoomFactor: {
      type: Number,
      default: olConsts.ZOOM_FACTOR
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
      let cb = args.find(isFunction)

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
        this.view.setCenter(center)
      }
      if (zoom != null && zoom !== this.currentZoom) {
        this.view.setZoom(zoom)
      }
      if (rotation != null && rotation !== this.currentRotation) {
        this.view.setRotation(rotation)
      }
    },
    mountView () {
      let view = this.map().getView()

      if (view && view.vm) {
        if (process.env.NODE_ENV !== 'production') {
          warn('Map already has unmounted vl-view component. ' +
               'It will be replaced with new.')
        }
        view.vm.unmountView()
      }

      this.map().setView(this.view)
    },
    unmountView () {
      this.map().setView(undefined)
    }
  }

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
    name: 'vl-map-view',
    inject: [ 'map' ],
    mixins: [ rxSubs ],
    props,
    methods,
    watch,
    render: h => h(),
    data () {
      return {
        currentZoom: this.zoom,
        currentCenter: this.center.slice(),
        currentRotation: this.rotation
      }
    },
    created () {
      this::createView()
      this::subscribeToViewChanges()
    },
    mounted () {
      this.mountView()
    },
    beforeDestroy () {
      this.unmountView()
    },
    destroyed () {
      this.view = undefined
    }
  }

  /**
   * @return {ol.View}
   */
  function createView () {
    /**
     * @type {ol.View}
     * @protected
     */
    this.view = new ol.View({
      center: ol.proj.fromLonLat(this.currentCenter, this.projection),
      zoom: this.currentZoom,
      maxZoom: this.maxZoom,
      minZoom: this.minZoom,
      projection: this.projection
    })
    this.view.vm = this

    return this.view
  }

  /**
   * Subscribe to OpenLayers significant events
   */
  function subscribeToViewChanges () {
    const viewChanges = Observable.fromOlEvent(this.view, 'change')
      .throttleTime(300)
      .map(() => {
        const center = ol.proj.toLonLat(this.view.getCenter(), this.projection)
        const zoom = Math.ceil(this.view.getZoom())
        const rotation = this.view.getRotation()

        return { center, zoom, rotation }
      })
      .distinctUntilChanged((a, b) => isEqual(a, b))

    this.rxSubs.viewChanges = viewChanges.subscribe(
      ({ center, zoom, rotation }) => {
        this.currentCenter = center
        this.currentZoom = zoom
        this.currentRotation = rotation
        this.$emit('change', { center, zoom, rotation })
      },
      errordbg
    )
  }
</script>

<style>
  /* stub style  */
</style>
