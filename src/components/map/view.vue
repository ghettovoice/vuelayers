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
        return proj.toLonLat(this.$view.getCenter(), this.$view.getProjection())
      }

      return []
    },
    currentResolution () {
      if (this.rev && this.$view) {
        return this.$view.getResolution()
      }
    },
    currentZoom () {
      if (this.rev && this.$view) {
        return Math.round(this.$view.getZoom())
      }
    },
    currentRotation () {
      if (this.rev && this.$view) {
        return this.$view.getRotation()
      }
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
     * @return {void}
     * @protected
     */
    defineAccessors () {
      Object.defineProperties(this, {
        $view: {
          enumerable: true,
          get: this.getView
        }
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
     * @return {ol.View|undefined} OpenLayers `ol.View` instance
     */
    getView () {
      return this.$olObject
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$parent && this.$parent.setView(this)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.unsubscribeAll()
      this.$parent && this.$parent.setView(undefined)
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
      if (this.$view && !isEqual(value, this.currentCenter)) {
        this.$view.setCenter(proj.fromLonLat(value, this.$view.getProjection()))
      }
    },
    resolution (value) {
      if (this.$view && value !== this.currentResolution) {
        this.$view.setResolution(value)
      }
    },
    zoom (value) {
      value = Math.round(value)
      if (this.$view && value !== this.currentZoom) {
        this.$view.setZoom(value)
      }
    },
    rotation (value) {
      if (this.$view && value !== this.currentRotation) {
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
      value: this.currentZoom
    })).debounceTime(ft * 2)
      .distinctUntilChanged(isEqual)
    const events = Observable.merge(
      // todo разобраться с зацикливанием и дерганием карты
      Observable.fromOlChangeEvent(this.$view, 'center', true, ft, () => this.currentCenter),
      Observable.fromOlChangeEvent(this.$view, 'rotation', true, ft),
      resolution,
      zoom
    ).map(({ prop, value }) => ({
      name: `update:${prop}`,
      value
    }))

    this.subscribeTo(events, ({ name, value }) => {
      ++this.rev
      this.$emit(name, value)
    })
  }
</script>
