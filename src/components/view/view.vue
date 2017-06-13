<script>
  import Vue from 'vue'
  import View from 'ol/view'
  import { isEqual, isPlainObject } from 'lodash/fp'
  import { Observable } from 'rxjs'
  import '../../rx-ext'
  import { MIN_ZOOM, MAX_ZOOM, MAP_PROJ, ZOOM_FACTOR, proj, geoJson } from '../../ol-ext'
  import cmp from '../ol-virt-cmp'
  import * as assert from '../../utils/assert'

  const props = {
    center: {
      type: Array,
      default: () => [0, 0],
      validator: value => value.length === 2
    },
    constrainRotation: Boolean,
    enableRotation: Boolean,
    extent: {
      type: Array,
      validator: value => value.length === 4
    },
    maxResolution: Number,
    minResolution: Number,
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
      default: MAP_PROJ
    },
    resolution: Number,
    resolutions: Array,
    rotation: {
      type: Number,
      default: 0
    },
    zoom: {
      type: Number,
      default: MIN_ZOOM
    },
    zoomFactor: {
      type: Number,
      default: ZOOM_FACTOR
    }
  }

  const methods = {
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#animate}
     * @param {...(olx.AnimationOptions|function(boolean))} args
     * @return {Promise} Resolves when animation completes
     */
    animate (...args) {
      assert.hasView(this)

      let cb = args.reverse().find(x => typeof x === 'function')

      return new Promise(
        resolve => this.view.animate(...args, complete => {
          cb && cb(complete)
          resolve(complete)
        })
      )
    },
    /**
     * @return {ol.View}
     * @protected
     */
    createOlObject () {
      return new View({
        center: proj.fromLonLat(this.center, this.projection),
        constrainRotation: this.constrainRotation,
        enableRotation: this.enableRotation,
        extent: this.extent,
        maxResolution: this.maxResolution,
        minResolution: this.minResolution,
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        projection: this.projection,
        resolution: this.resolution,
        resolutions: this.resolutions,
        rotation: this.rotation,
        zoom: this.zoom,
        zoomFactor: this.zoomFactor
      })
    },
    /**
     * @return {void}
     * @protected
     */
    defineAccessors () {
      Object.defineProperties(this, {
        view: {
          enumerable: true,
          get: this.getView
        }
      })
    },
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#fit}
     * @param {GeoJSONFeature|ol.Extent|ol.Geometry|Vue} geometryOrExtent
     * @param {olx.view.FitOptions} [options]
     * @return {Promise} Resolves when view changes
     */
    fit (geometryOrExtent, options) {
      assert.hasView(this)

      // transform to GeoJSON, vl-feature to ol.Feature
      if (isPlainObject(geometryOrExtent)) {
        geometryOrExtent = geoJson.readGeometry(geometryOrExtent, this.view.getProjection())
      } else if (geometryOrExtent instanceof Vue) {
        geometryOrExtent = geometryOrExtent.geom
      }

      let duration = (options && options.duration) || 0

      return new Promise(resolve => {
        this.view.fit(geometryOrExtent, options)
        setTimeout(resolve, duration)
      })
    },
    /**
     * @return {ol.View|undefined} OpenLayers `ol.View` instance
     */
    getView () {
      return this.olObject
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$parent.setView(this)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.unsubscribeAll()
      this.$parent.setView(undefined)
    },
    /**
     * @return {void}
     */
    refresh () {
      assert.hasView(this)
      this.view.changed()
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToViewChanges()
    },
    /**
     * @param {olx.ViewOptions} viewOptions
     * @return {void}
     * @protected
     */
    updateView (viewOptions) {
      assert.hasView(this)
      // center
      if (viewOptions.center != null && !isEqual(viewOptions.center, this.currentCenter)) {
        this.view.setCenter(proj.fromLonLat(viewOptions.center, this.projection))
      }
      // resolution
      if (viewOptions.resolution != null && viewOptions.resolution !== this.currentResolution) {
        this.view.setResolution(viewOptions.resolution)
      }
      // zoom
      if (viewOptions.zoom != null && Math.ceil(viewOptions.zoom) !== this.currentZoom) {
        this.view.setZoom(Math.ceil(viewOptions.zoom))
      }
      // rotation
      if (viewOptions.rotation != null && viewOptions.rotation !== this.currentRotation) {
        this.view.setRotation(viewOptions.rotation)
      }
      // minZoom
      if (viewOptions.minZoom != null && viewOptions.minZoom !== this.view.getMinZoom()) {
        this.view.setMinZoom(viewOptions.minZoom)
      }
      // maxZoom
      if (viewOptions.maxZoom != null && viewOptions.maxZoom !== this.view.getMaxZoom()) {
        this.view.setMaxZoom(viewOptions.maxZoom)
      }
    }
  }

  const watch = {
    center (center) {
      this.updateView({ center })
    },
    resolution (resolution) {
      this.readyPromise.then(() => this.updateView({ resolution }))
    },
    zoom (zoom) {
      this.readyPromise.then(() => this.updateView({ zoom }))
    },
    rotation (rotation) {
      this.readyPromise.then(() => this.updateView({ rotation }))
    },
    minZoom (minZoom) {
      this.readyPromise.then(() => this.updateView({ minZoom }))
    },
    maxZoom (maxZoom) {
      this.readyPromise.then(() => this.updateView({ maxZoom }))
    }
  }

  export default {
    name: 'vl-view',
    mixins: [cmp],
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
        currentCenter: this.center.splice(),
        currentZoom: Math.ceil(this.zoom),
        currentResolution: this.resolution,
        currentRotation: this.rotation
      }
    }
  }

  /**
   * Subscribe to OpenLayers significant events
   * @return {void}
   * @private
   */
  function subscribeToViewChanges () {
    assert.hasView(this)

    const ft = 1000 / 30
    const getZoom = () => Math.ceil(this.view.getZoom())
    // center
    this.subscribeTo(
      Observable.of(this.view.getCenter())
        .merge(Observable.fromOlEvent(
          this.view,
          'change:center',
          () => this.view.getCenter()
        ))
        .throttleTime(ft)
        .distinctUntilChanged(isEqual)
        .map(coordinate => proj.toLonLat(coordinate, this.view.getProjection())),
      coordinate => {
        if (!isEqual(this.currentCenter, coordinate)) {
          this.currentCenter = coordinate
          this.$emit('changecenter', { coordinate })
        }
      }
    )
    // resolution
    this.subscribeTo(
      Observable.of(this.view.getResolution())
        .merge(Observable.fromOlEvent(
          this.view,
          'change:resolution',
          () => this.view.getResolution()
        ))
        // 30fps change resolution
        .throttleTime(ft)
        .distinctUntilChanged(isEqual)
        .map(resolution => ({ resolution, zoom: getZoom() }))
        .do(({ resolution }) => {
          if (this.currentResolution !== resolution) {
            this.currentResolution = resolution
            this.$emit('changeresolution', { resolution })
          }
        })
        // zoom change at the end
        .debounceTime(ft * 2),
      ({ zoom }) => {
        if (this.currentZoom !== zoom) {
          this.currentZoom = zoom
          this.$emit('changezoom', { zoom })
        }
      }
    )
    // rotation
    this.subscribeTo(
      Observable.of(this.view.getRotation())
        .merge(Observable.fromOlEvent(
          this.view,
          'change:rotation',
          () => this.view.getRotation()
        ))
        .throttleTime(ft)
        .distinctUntilChanged(isEqual),
      rotation => {
        if (this.currentRotation !== rotation) {
          this.currentRotation = rotation
          this.$emit('changerotation', { rotation })
        }
      }
    )
  }
</script>
