<script>
  import Vue from 'vue'
  import View from 'ol/view'
  import { isEqual, isPlainObject, noop } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/merge'
  import 'rxjs/add/operator/debounceTime'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/map'
  import '../../rx-ext'
  import { MIN_ZOOM, MAX_ZOOM, EPSG_3857, ZOOM_FACTOR, proj, geoJson } from '../../ol-ext'
  import cmp from '../ol-virt-cmp'
  import * as assert from '../../utils/assert'

  const props = {
    center: {
      type: Array,
      default: () => [0, 0],
      validator: value => value.length === 2
    },
    constrainRotation: {
      type: Boolean,
      default: true
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
      default: EPSG_3857
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

  const computed = {
    currentCenter () {
      if (this.rev && this.$view) {
        return this::getCenter()
      }

      return this.center
    },
    currentResolution () {
      if (this.rev && this.$view) {
        return this.$view.getResolution()
      }

      return this.resolution
    },
    currentZoom () {
      if (this.rev && this.$view) {
        return this::getZoom()
      }

      return this.zoom
    },
    currentRotation () {
      if (this.rev && this.$view) {
        return this.$view.getRotation()
      }

      return this.rotation
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

      let cb = args.reverse().find(x => typeof x === 'function') || noop

      return new Promise(
        resolve => this.$view.animate(...args, complete => {
          cb(complete)
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
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#fit}
     * @param {GeoJSONFeature|ol.Extent|ol.geom.Geometry|Vue} geometryOrExtent
     * @param {olx.view.FitOptions} [options]
     * @return {Promise} Resolves when view changes
     */
    fit (geometryOrExtent, options = {}) {
      assert.hasView(this)

      // transform to GeoJSON, vl-feature to ol.Feature
      if (isPlainObject(geometryOrExtent)) {
        geometryOrExtent = geoJson.readGeometry(geometryOrExtent, this.$view.getProjection())
      } else if (geometryOrExtent instanceof Vue) {
        geometryOrExtent = geometryOrExtent.$geometry
      }

      let cb = options.callback || noop

      return new Promise(resolve => {
        this.$view.fit(geometryOrExtent, {
          ...options,
          callback: complete => {
            cb(complete)
            resolve(complete)
          }
        })
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$viewContainer && this.$viewContainer.setView(this)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.unsubscribeAll()
      this.$viewContainer && this.$viewContainer.setView(undefined)
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToViewChanges()
    }
  }

  const watch = {
    center (value) {
      if (this.$view && !isEqual(value, this::getCenter())) {
        this.$view.setCenter(proj.fromLonLat(value, this.$view.getProjection()))
      }
    },
    resolution (value) {
      if (this.$view && value !== this.$view.getResolution()) {
        this.$view.setResolution(value)
      }
    },
    zoom (value) {
      value = Math.round(value)
      if (this.$view && value !== this::getZoom()) {
        this.$view.setZoom(value)
      }
    },
    rotation (value) {
      if (this.$view && value !== this.$view.getRotation()) {
        this.$view.setRotation(value)
      }
    },
    minZoom (value) {
      if (this.$view && value !== this.$view.getMinZoom()) {
        this.$view.setMinZoom(value)
      }
    },
    maxZoom (value) {
      if (this.$view && value !== this.$view.getMaxZoom()) {
        this.$view.setMaxZoom(value)
      }
    }
  }

  export default {
    name: 'vl-view',
    mixins: [cmp],
    props,
    computed,
    methods,
    watch,
    stubVNode: {
      empty () {
        return this.$options.name
      }
    },
    data () {
      return {
        rev: 1
      }
    },
    created () {
      Object.defineProperties(this, {
        /**
         * @type {ol.View|undefined}
         */
        $view: {
          enumerable: true,
          get: () => this.$olObject
        },
        $viewContainer: {
          enumerable: true,
          get: () => this.$services && this.$services.viewContainer
        }
      })
    }
  }

  /**
   * Subscribe to OpenLayers significant events
   * @return {void}
   * @private
   */
  function subscribeToViewChanges () {
    assert.hasView(this)

    const ft = 100
    const resolution = Observable.fromOlChangeEvent(this.$view, 'resolution', true, ft)
    const zoom = resolution.map(() => ({
      prop: 'zoom',
      value: this::getZoom()
    })).debounceTime(2 * ft)
      .distinctUntilChanged(isEqual)

    const changes = Observable.merge(
      Observable.fromOlChangeEvent(this.$view, 'center', true, ft, this::getCenter),
      Observable.fromOlChangeEvent(this.$view, 'rotation', true, ft),
      resolution,
      zoom
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev
      this.$emit(`update:${prop}`, value)
    })
  }

  function getZoom () {
    return Math.round(this.$view.getZoom())
  }

  function getCenter () {
    return proj.toLonLat(this.$view.getCenter(), this.$view.getProjection())
  }
</script>
