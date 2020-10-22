import { Feature } from 'ol'
import ObjectEventType from 'ol/ObjectEventType'
import { race as raceObs } from 'rxjs'
import { distinctUntilChanged, filter as filterObs, mapTo } from 'rxjs/operators'
import {
  dumpStyle,
  EPSG_3857,
  findPointOnSurface,
  getFeatureId,
  getFeatureProperties,
  initializeFeature,
  setFeatureId,
  setFeatureProperties,
} from '../ol-ext'
import { fromOlEvent as obsFromOlEvent, fromVueEvent as obsFromVueEvent } from '../rx-ext'
import {
  assert,
  clonePlainObject,
  coalesce,
  hasProp,
  isArray,
  isEmpty,
  isEqual,
  isFunction,
  isObjectLike,
  isString,
  mergeDescriptors,
  stubObject,
  stubTrue,
  waitFor,
} from '../utils'
import geometryContainer from './geometry-container'
import olCmp, {
  CanceledError,
  isCreateError,
  isMountError,
  makeChangeOrRecreateWatchers,
  OlObjectEvent,
} from './ol-cmp'
import projTransforms from './proj-transforms'
import stubVNode from './stub-vnode'
import styleContainer from './style-container'
import waitForMap from './wait-for-map'

/**
 * A vector object for geographic features with a geometry and other attribute properties,
 * similar to the features in vector file formats like **GeoJSON**.
 */
export default {
  mixins: [
    stubVNode,
    projTransforms,
    geometryContainer,
    styleContainer,
    olCmp,
    waitForMap,
  ],
  stubVNode: {
    empty: false,
    attrs () {
      return {
        id: this.vmId,
        class: this.vmClass,
      }
    },
  },
  props: {
    properties: {
      type: Object,
      default: stubObject,
    },
  },
  data () {
    return {
      viewProjection: EPSG_3857,
      dataProjection: EPSG_3857,
      currentProperties: clonePlainObject(this.properties),
      currentGeometryName: 'geometry',
    }
  },
  computed: {
    geometryDataProj () {
      if (!(this.rev && this.$geometry)) return

      return this.writeGeometryInDataProj(this.$geometry)
    },
    geometryViewProj () {
      if (!(this.rev && this.$geometry)) return

      return this.writeGeometryInViewProj(this.$geometry)
    },
    pointDataProj () {
      return this.pointToDataProj(this.pointViewProj)
    },
    pointViewProj () {
      if (!(this.rev && this.$geometry)) return

      return findPointOnSurface(this.$geometry)
    },
    style () {
      if (!(this.rev && this.$style)) return

      let style = this.$style
      if (isFunction(style)) return style
      if (!style) return

      isArray(style) || (style = [style])

      return style.map(style => dumpStyle(style, geom => this.writeGeometryInDataProj(geom)))
    },
  },
  watch: {
    rev () {
      if (!this.$feature) return

      if (!isEqual(this.currentProperties, getFeatureProperties(this.$feature))) {
        this.currentProperties = getFeatureProperties(this.$feature)
      }
      if (this.currentGeometryName !== this.$feature.getGeometryName()) {
        this.currentGeometryName = this.$feature.getGeometryName()
      }
    },
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'properties',
      'currentProperties',
      'currentGeometryName',
      'geometryDataProj',
      'pointDataProj',
      'style',
    ], [
      'properties',
      'currentProperties',
      'geometryDataProj',
      'pointDataProj',
      'style',
    ]),
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    async beforeInit () {
      await Promise.all([
        this::olCmp.methods.beforeInit(),
        this::waitForMap.methods.beforeInit(),
      ])
    },
    /**
     * Create feature without inner style applying, feature level style
     * will be applied in the layer level style function.
     * @return {module:ol/Feature~Feature}
     * @protected
     */
    createOlObject () {
      const feature = initializeFeature(this.createFeature(), this.currentId)
      feature.setGeometryName(this.currentGeometryName)
      feature.setGeometry(this.$geometry)
      feature.setStyle(this.$style)

      return feature
    },
    /**
     * @returns {Feature}
     */
    createFeature () {
      return new Feature(this.currentProperties)
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async beforeMount () {
      try {
        await waitFor(
          () => this.$geometryVm != null,
          raceObs(
            this.$olObjectEvents.pipe(
              filterObs(({ name, args }) => {
                return name === OlObjectEvent.ERROR &&
                  args[0] instanceof CanceledError
              }),
            ),
            obsFromVueEvent(this.$eventBus, ObjectEventType.ERROR).pipe(
              filterObs(([err, vm]) => {
                return (isCreateError(err) || isMountError(err)) &&
                  hasProp(vm, '$geometry') &&
                  vm.$vq?.closest(this)
              }),
            ),
          ).pipe(
            mapTo(stubTrue()),
          ),
        )

        return this::olCmp.methods.beforeMount()
      } catch (err) {
        err.message = `${this.vmName} wait for $geometry failed: ${err.message}`
        throw err
      }
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      this.$featuresContainer?.addFeature(this)

      return this::olCmp.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      this.$featuresContainer?.removeFeature(this)

      return this::olCmp.methods.unmount()
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::olCmp.methods.subscribeAll()
      this::subscribeToEvents()
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::olCmp.methods.getServices(),
        this::geometryContainer.methods.getServices(),
        this::styleContainer.methods.getServices(),
        {
          get featureVm () { return vm },
        },
      )
    },
    /**
     * @return {string|number}
     */
    getIdInternal () {
      return getFeatureId(this.$feature)
    },
    /**
     * @param {string|number} id
     * @return {void}
     */
    setIdInternal (id) {
      if (id === this.getIdInternal()) return

      setFeatureId(this.$feature, id)
    },
    /**
     * @return {Promise<Feature>}
     */
    resolveFeature: olCmp.methods.resolveOlObject,
    /**
     * @return {Feature}
     * @protected
     */
    getGeometryTarget () {
      return this.$feature
    },
    /**
     * @return {Feature}
     * @protected
     */
    getStyleTarget () {
      return this.$feature
    },
    /**
     * @return {string}
     */
    getGeometryName () {
      return coalesce(this.$feature?.getGeometryName(), this.currentGeometryName)
    },
    /**
     * @param {string} geometryName
     */
    setGeometryName (geometryName) {
      assert(isString(geometryName) && !isEmpty(geometryName), 'Invalid geometry name')

      if (geometryName !== this.currentGeometryName) {
        this.currentGeometryName = geometryName
      }
      if (this.$feature && geometryName !== this.$feature.getGeometryName()) {
        this.$feature.setGeometryName(geometryName)
      }
    },
    /**
     * @return {Object}
     */
    getProperties () {
      return coalesce(this.$feature && getFeatureProperties(this.$feature), this.currentProperties)
    },
    /**
     * @param {Object} properties
     */
    setProperties (properties) {
      properties = getFeatureProperties({ properties })

      if (!isEqual(properties, this.currentProperties)) {
        this.currentProperties = properties
      }
      if (this.$feature && !isEqual(properties, getFeatureProperties(this.$feature))) {
        setFeatureProperties(this.$feature, properties)
      }
    },
    /**
     * Checks if feature lies at `pixel`.
     * @param {number[]} pixel
     * @return {Promise<boolean>}
     */
    async isAtPixel (pixel) {
      const selfFeature = await this.resolveFeature()
      let layerFilter
      if (this.$layerVm) {
        const selfLayer = await this.$layerVm.resolveLayer()
        layerFilter = layer => layer === selfLayer
      }

      return this.$mapVm.forEachFeatureAtPixel(pixel, feature => feature === selfFeature, { layerFilter })
    },
    /**
     * @param {Object|undefined} value
     * @protected
     */
    propertiesChanged (value) {
      this.setProperties(value)
    },
    /**
     * @param {Object|undefined} value
     * @protected
     */
    currentPropertiesChanged (value) {
      if (isEqual(value, this.properties)) return

      this.$emit('update:properties', value && clonePlainObject(value))
    },
    /**
     * @param {string} value
     * @param {string} prev
     * @protected
     */
    currentGeometryNameChanged (value, prev) {
      if (value === prev) return

      this.$emit('update:geometryName', value)
    },
    /**
     * @param {Object|undefined} value
     * @param {Object|undefined} prev
     * @protected
     */
    geometryDataProjChanged (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:geometry', value && clonePlainObject(value))
    },
    /**
     * @param {Object|undefined} value
     * @param {Object|undefined} prev
     * @protected
     */
    pointDataProjChanged (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:point', value && clonePlainObject(value))
    },
    /**
     * @param {Object|Function|Array|undefined} value
     * @param {Object|Function|Array|undefined} prev
     * @protected
     */
    styleChanged (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:style', isObjectLike(value) ? clonePlainObject(value) : value)
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $feature: {
      enumerable: true,
      get: () => this.$olObject,
    },
    $layerVm: {
      enumerable: true,
      get: () => this.$services?.layerVm,
    },
    $mapVm: {
      enumerable: true,
      get: () => this.$services?.mapVm,
    },
    $featuresContainer: {
      enumerable: true,
      get: () => this.$services?.featuresContainer,
    },
  })
}

async function subscribeToEvents () {
  const propChanges = obsFromOlEvent(
    this.$feature,
    ObjectEventType.PROPERTYCHANGE,
    ({ key }) => {
      switch (key) {
        case this.$feature.getGeometryName():
          return {
            prop: 'geometry',
            value: this.$feature.getGeometry(),
            setter: geom => this.setGeometry(geom, true),
          }
        default:
          return {
            prop: 'properties',
            value: getFeatureProperties(this.$feature),
            setter: this.setProperties,
          }
      }
    },
  ).pipe(
    distinctUntilChanged(isEqual),
  )
  this.subscribeTo(propChanges, ({ setter, value }) => setter(value))
}
