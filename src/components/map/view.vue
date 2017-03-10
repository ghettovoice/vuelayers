<script>
  import ol from 'openlayers'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/combineLatest'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/throttleTime'
  import 'rxjs/add/operator/map'
  import 'vl-rx'
  import { isFunction, isEqual } from 'vl-utils/func'
  import { errordbg, warn } from 'vl-utils/debug'
  import rxSubs from 'vl-mixins/rx-subs'
  import vmBind from 'vl-mixins/vm-bind'
  import stubVNode from 'vl-mixins/stub-vnode'
  import { consts as olConsts } from 'vl-ol'

  const props = {
    zoom: {
      type: Number,
      default: olConsts.MIN_ZOOM
    },
    center: {
      type: Array,
      default: () => [ 0, 0 ],
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
      this.view && this.view.fit(geometryOrExtent, options)
    },
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#animate}
     * @param {...Object} args
     * @return {Promise}
     */
    animate (...args) {
      let cb = args.find(isFunction)

      if (!this.view) return Promise.reject()

      return new Promise(
        resolve => this.view.animate(...args, complete => {
          cb && cb(complete)
          resolve(complete)
        })
      )
    },
    refresh () {
      this.view && this.view.changed()
    },
    setCurrentView ({ center, zoom, rotation }) {
      if (!this.view) return

      if (center != null && !isEqual(center, this.currentCenter)) {
        this.view.setCenter(ol.proj.fromLonLat(center, this.projection))
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
        warn("Invalid usage of view component, should have map component among it's ancestors")
      }

      let view = this.map.getView()

      if (view && view.$vm) {
        if (process.env.NODE_ENV !== 'production') {
          warn('Map already has mounted vl-view component. ' +
               'It will be replaced with new.')
        }
        view.$vm.unmountView()
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
    name: 'vl-map-view',
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
        delete this.view.$vm
        this.view = undefined
      })
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

    this.bindSelfTo(this.view)

    return this.view
  }

  /**
   * Subscribe to OpenLayers significant events
   */
  function subscribeToViewChanges () {
    const viewChanges = Observable.combineLatest(
      Observable.fromOlEvent(this.view, 'change:center'),
      Observable.fromOlEvent(this.view, 'change:zoom'),
      Observable.fromOlEvent(this.view, 'change:rotation')
    ).throttleTime(1000)
      .distinctUntilChanged((a, b) => isEqual(a, b))
      .map(() => {
        const center = ol.proj.toLonLat(this.view.getCenter(), this.projection)
        const zoom = Math.ceil(this.view.getZoom())
        const rotation = this.view.getRotation()

        return { center, zoom, rotation }
      })

    this.rxSubs.viewChanges = viewChanges.subscribe(
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
      },
      err => errordbg(err.stack)
    )
  }
</script>

<style>
  /* stub style  */
</style>
