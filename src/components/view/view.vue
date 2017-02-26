<script>
  import ol from 'openlayers'
  import { isFunction, isEqual } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/combineLatest'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/throttleTime'
  import 'vuelayers/src/rx'
  import { round } from 'vuelayers/src/utils/func'
  import exposeContext from 'vuelayers/src/mixins/expose-context'
  import rxSubs from 'vuelayers/src/mixins/rx-subs'
  import { MIN_ZOOM, MAX_ZOOM, MAP_PROJECTION, ZOOM_FACTOR } from 'vuelayers/src/ol'

  const props = {
    zoom: {
      type: Number,
      default: MIN_ZOOM
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
      validator: value => value.length === 4
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
      let cb = args.find(isFunction)

      return new Promise(
        resolve => this.view.animate(...args, complete => {
          cb && cb(complete)
          resolve(complete)
        })
      )
    },
    getView () {
      return this.view
    },
    refresh () {
      this.view.changed()
    },
    context () {
      return {
        ...this.$parent.context(),
        view: this.view
      }
    }
  }

  export default {
    name: 'vl-view',
    mixins: [ exposeContext, rxSubs ],
    props,
    methods,
    render: h => h(),
    data () {
      return {
        currentZoom: this.zoom,
        currentCenter: this.center,
        currentRotation: this.rotation
      }
    },
    created () {
      this::createView()

      this::subscribeToViewChanges()
    },
    mounted () {
      this.context().map.setView(this.view)
    },
    beforeDestroy () {
      this.context().map.setView(undefined)

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
    const viewChanges = Observable.fromOlEvent(this.view, 'change', () => {
      const center = ol.proj.toLonLat(this.view.getCenter(), this.projection)
        .map(x => round(x, 6))
      const zoom = Math.ceil(this.view.getZoom())
      const rotation = round(this.view.getRotation(), 6)

      return [ center, zoom, rotation ]
    }).throttleTime(100)
      .distinctUntilChanged((a, b) => isEqual(a, b))

    this.subs.viewChanges = viewChanges.subscribe(
      ([ center, zoom, rotation ]) => {
        this.currentZoom = zoom
        this.currentCenter = center
        this.currentRotation = rotation
        this.$emit('change', [ center, zoom, rotation ])
      },
      ::console.error
    )
  }
</script>
