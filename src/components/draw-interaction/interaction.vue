<script>
  import { Collection } from 'ol'
  import { noModifierKeys, shiftKeyOnly } from 'ol/events/condition'
  import GeometryType from 'ol/geom/GeometryType'
  import { Draw as DrawInteraction } from 'ol/interaction'
  import { Vector as VectorSource } from 'ol/source'
  import { merge as mergeObs, of as obsOf } from 'rxjs'
  import { delay, first, map as mapObs, mapTo, mergeMap, tap } from 'rxjs/operators'
  import { FRAME_TIME, interaction, makeChangeOrRecreateWatchers, styleContainer } from '../../mixins'
  import { COORD_PRECISION, initializeFeature, roundLineCoords, writeGeoJsonFeature } from '../../ol-ext'
  import { fromOlEvent as obsFromOlEvent, fromVueEvent as obsFromVueEvent } from '../../rx-ext'
  import { assert, camelCase, instanceOf, isFunction, mergeDescriptors, upperFirst } from '../../utils'

  const transformType = /*#__PURE__*/type => upperFirst(camelCase(type))

  export default {
    name: 'VlInteractionDraw',
    mixins: [
      interaction,
      styleContainer,
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
      /**
       * Target source or collection identifier from IdentityMap.
       * @type {String}
       */
      source: {
        type: String,
        required: true,
      },
      /**
       * The maximum distance in pixels between "down" and "up" for a "up" event to be considered a "click" event and
       * actually add a point/vertex to the geometry being drawn. Default is 6 pixels. That value was chosen for the
       * draw interaction to behave correctly on mouse as well as on touch devices.
       * @type {number}
       */
      clickTolerance: {
        type: Number,
        default: 6,
      },
      /**
       * Pixel distance for snapping to the drawing finish.
       * @type {number}
       */
      snapTolerance: {
        type: Number,
        default: 12,
      },
      /**
       * Drawing type ('Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle').
       * @type {string}
       */
      type: {
        type: String,
        required: true,
        validator: value => Object.values(GeometryType).includes(transformType(value)),
      },
      /**
       * Stop click, singleclick, and doubleclick events from firing during drawing.
       * @type {boolean}
       */
      stopClick: {
        type: Boolean,
        default: false,
      },
      /**
       * The number of points that can be drawn before a polygon ring or line string is finished.
       * @type {number|undefined}
       */
      maxPoints: Number,
      /**
       * The number of points that must be drawn before a polygon ring or line string can be finished.
       * Default is `3` for polygon rings and `2` for line strings.
       * @type {number|undefined}
       */
      minPoints: Number,
      /**
       * A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether the drawing can be finished.
       * @type {function|undefined}
       */
      finishCondition: Function,
      /**
       * Function that is called when a geometry's coordinates are updated.
       * @type {function|undefined}
       */
      geometryFunction: Function,
      /**
       * Name of the geometry attribute for newly created features.
       * @type {string}
       */
      geometryName: {
        type: String,
        default: 'geometry',
      },
      /**
       * A function that takes an `ol.MapBrowserEvent` and returns a boolean to indicate whether that event should be handled.
       * By default `ol.events.condition.noModifierKeys`, i.e. a click, adds a vertex or deactivates freehand drawing.
       * @type {function|undefined}
       */
      condition: {
        type: Function,
        default: noModifierKeys,
      },
      /**
       * Operate in freehand mode for lines, polygons, and circles. This makes the interaction always operate in
       * freehand mode and takes precedence over any `freehandCondition` option.
       * @type {boolean}
       */
      freehand: {
        type: Boolean,
        default: false,
      },
      /**
       * Condition that activates freehand drawing for lines and polygons. This function takes an `ol.MapBrowserEvent` and
       * returns a boolean to indicate whether that event should be handled. The default is `ol.events.condition.shiftKeyOnly`,
       * meaning that the Shift key activates freehand drawing.
       * @type {function|undefined}
       */
      freehandCondition: {
        type: Function,
        default: shiftKeyOnly,
      },
      /**
       * Wrap the world horizontally on the sketch overlay.
       * @type {boolean}
       */
      wrapX: {
        type: Boolean,
        default: false,
      },
      /**
       * Delay in milliseconds after pointerdown before the current vertex can be dragged to its exact position.
       * @type {number}
       */
      dragVertexDelay: {
        type: Number,
        default: 500,
      },
    },
    computed: {
      inputType () {
        return transformType(this.type)
      },
    },
    watch: {
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'source',
        'clickTolerance',
        'snapTolerance',
        'inputType',
        'stopClick',
        'maxPoints',
        'minPoints',
        'finishCondition',
        'geometryFunction',
        'geometryName',
        'condition',
        'freehand',
        'freehandCondition',
        'wrapX',
        'dragVertexDelay',
      ]),
    },
    methods: {
      /**
       * @return {Promise<Draw>}
       * @protected
       */
      async createInteraction () {
        let source = this._source = await this.getInstance(this.source)
        assert(!!source, `Source "${this.source}" not found in identity map.`)
        let features
        if (!(source instanceof VectorSource)) {
          if (isFunction(source.getFeaturesCollection)) {
            features = source.getFeaturesCollection()
          } else if (isFunction(source.getFeatures)) {
            features = source.getFeatures()
          }
          instanceOf(features, Collection, `Source "${this.source}" doesn't provide features collection.`)
          source = null
        }

        return new DrawInteraction({
          source,
          features,
          clickTolerance: this.clickTolerance,
          snapTolerance: this.snapTolerance,
          type: this.inputType,
          stopClick: this.stopClick,
          maxPoints: this.maxPoints,
          minPoints: this.minPoints,
          finishCondition: this.finishCondition,
          geometryFunction: this.geometryFunction,
          geometryName: this.geometryName,
          condition: this.condition,
          freehand: this.freehand,
          freehandCondition: this.freehandCondition,
          wrapX: this.wrapX,
          dragVertexDelay: this.dragVertexDelay,
          style: this.$style,
        })
      },
      /**
       * @returns {Object}
       * @protected
       */
      getServices () {
        return mergeDescriptors(
          this::interaction.methods.getServices(),
          this::styleContainer.methods.getServices(),
        )
      },
      /**
       * @return {void}
       * @protected
       */
      subscribeAll () {
        this::interaction.methods.subscribeAll()
        this::subscribeToInteractionChanges()
      },
      /**
       * @return {StyleTarget}
       * @protected
       */
      getStyleTarget () {
        return {
          getStyle: () => this._style,
          setStyle: () => {
            if (process.env.VUELAYERS_DEBUG) {
              this.$logger.log('style changed, scheduling recreate...')
            }

            this.scheduleRecreate()
          },
        }
      },
      async getOverlay () {
        return (await this.resolveInteraction()).getOverlay()
      },
      async abortDrawing () {
        (await this.resolveInteraction()).abortDrawing()
      },
      async finishDrawing () {
        (await this.resolveInteraction()).finishDrawing()
      },
      async appendCoordinates (coordinates, viewProj = false) {
        coordinates = viewProj ? roundLineCoords(coordinates) : this.lineToViewProj(coordinates);

        (await this.resolveInteraction()).appendCoordinates(coordinates)
      },
      async removeLastPoint () {
        (await this.resolveInteraction()).removeLastPoint()
      },
      async getPointerCount () {
        return (await this.resolveInteraction()).getPointerCount()
      },
    },
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToInteractionChanges () {
    const start = obsFromOlEvent(this.$interaction, 'drawstart').pipe(
      mapObs(evt => ({
        ...evt,
        feature: initializeFeature(evt.feature),
      })),
      tap(() => this.setInteracting(true)),
    )
    const sourceUpdObs = () => {
      if (!this._source?.vm?.length) {
        return obsOf(true).pipe(delay(3 * FRAME_TIME))
      }
      // update:features on the source (which is feature-container)
      // will be always after drawend with delay ~= computed property update time + FRAME_TIME
      // so we can safely just wait first event
      return obsFromVueEvent(this._source.vm[0], 'update:features').pipe(
        first(),
      )
    }
    const end = obsFromOlEvent(this.$interaction, 'drawend').pipe(
      mergeMap(evt => sourceUpdObs().pipe(
        mapTo(evt),
      )),
      tap(() => this.setInteracting(false)),
    )
    const events = mergeObs(start, end).pipe(
      mapObs(({ type, feature }) => {
        const viewProj = this.resolvedViewProjection
        const dataProj = this.resolvedDataProjection
        return {
          type,
          feature,
          get json () {
            if (!this._json) {
              this._json = writeGeoJsonFeature(this.feature, viewProj, dataProj, COORD_PRECISION)
            }
            return this._json
          },
        }
      }),
    )
    this.subscribeTo(events, evt => this.$emit(evt.type, evt))
  }
</script>
