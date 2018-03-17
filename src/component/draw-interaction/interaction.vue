<script>
  /**
   * @module draw-interaction/interaction
   */
  import Collection from 'ol/collection'
  import DrawInteraction from 'ol/interaction/draw'
  import { Observable } from 'rxjs'
  import { merge as mergeObs } from 'rxjs/observable'
  import { map as mapObs } from 'rxjs/operator'
  import { CollectionFeaturesTarget, featuresContainer } from '../../mixin/features-container'
  import interaction from '../../mixin/interaction'
  import projTransforms from '../../mixin/proj-transforms'
  import stylesContainer from '../../mixin/styles-container'
  import { GEOMETRY_TYPE } from '../../ol-ext/consts'
  import { defaultEditStyle, style as createStyle } from '../../ol-ext/style'
  import observableFromOlEvent from '../../rx-ext/from-ol-event'
  import { hasInteraction } from '../../util/assert'
  import { mapValues, stubArray } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  // TODO bind with external destination source
  /**
   * @vueProps
   */
  const props = {
    /**
     * Initial set of features.
     * @type {GeoJSONFeature[]}
     */
    features: {
      type: Array,
      default: stubArray,
    },
    /**
     * Target source identifier from IdentityMap.
     * @type {String}
     */
    source: String,
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
      validator: value => Object.keys(GEOMETRY_TYPE),
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
     * @type {ol.EventsConditionType|function|undefined}
     */
    finishCondition: Function,
    /**
     * Function that is called when a geometry's coordinates are updated.
     * @type {ol.DrawGeometryFunctionType|function|undefined}
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
     * @type {ol.EventsConditionType|function|undefined}
     */
    condition: Function,
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
     * @type {ol.EventsConditionType|function|undefined}
     */
    freehandCondition: Function,
    /**
     * Wrap the world horizontally on the sketch overlay.
     * @type {boolean}
     */
    wrapX: {
      type: Boolean,
      default: false,
    },
  }

  /**
   * @vueMethods
   */
  const methods = {
    /**
     * @return {Promise<ol.interaction.Draw>}
     * @protected
     */
    async createInteraction () {
      let sourceIdent = this.makeIdent(this.source, this.$options.INSTANCE_PROMISE_IDENT_SUFFIX)
      let source = await this.$identityMap.get(sourceIdent)

      return new DrawInteraction({
        source: source,
        features: this.getFeaturesTarget().getAdaptee(),
        clickTolerance: this.clickTolerance,
        snapTolerance: this.snapTolerance,
        type: this.type,
        stopClick: this.stopClick,
        maxPoints: this.maxPoints,
        minPoints: this.minPoints,
        finishCondition: this.finishCondition,
        style: this.createStyleFunc(),
        geometryFunction: this.geometryFunction,
        geometryName: this.geometryName,
        condition: this.condition,
        freehand: this.freehand,
        freehandCondition: this.freehandCondition,
        wrapX: this.wrapX,
      })
    },
    /**
     * @return {ol.StyleFunction}
     * @protected
     */
    getDefaultStyles () {
      const defaultStyles = mapValues(defaultEditStyle(), styles => styles.map(createStyle))

      return function __selectDefaultStyleFunc (feature) {
        if (feature.getGeometry()) {
          return defaultStyles[feature.getGeometry().getType()]
        }
      }
    },
    /**
     * @return {FeaturesTarget}
     * @protected
     */
    getFeaturesTarget () {
      if (this._featuresTarget == null) {
        this._featuresTarget = new CollectionFeaturesTarget(new Collection())
      }

      return this._featuresTarget
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(
        this::interaction.methods.getServices(),
        this::stylesContainer.methods.getServices(),
      )
    },
    /**
     * @return {ol.interaction.Interaction|undefined}
     * @protected
     */
    getStyleTarget () {
      return this.$interaction
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this::interaction.methods.mount()
      this.addFeatures(this.features)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this::interaction.methods.unmount()
    },
    /**
     * @param {Array<{style: ol.style.Style, condition: (function|boolean|undefined)}>|ol.StyleFunction|Vue|undefined} styles
     * @return {void}
     * @protected
     */
    setStyle (styles) {
      if (styles !== this._styles) {
        this._styles = styles
        this.refresh()
      }
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToInteractionChanges()
    },
  }

  const watch = {}

  /**
   * @alias module:draw-interaction/interaction
   * @title vl-interaction-draw
   * @vueProto
   */
  export default {
    name: 'vl-interaction-draw',
    mixins: [interaction, featuresContainer, stylesContainer, projTransforms],
    props,
    methods,
    watch,
    stubVNode: {
      empty: false,
      attrs () {
        return {
          class: this.$options.name,
        }
      },
    },
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToInteractionChanges () {
    hasInteraction(this)

    const drawEvents = Observable::mergeObs(
      observableFromOlEvent(this.$interaction, 'drawstart')
        ::mapObs(evt => {
          this.prepareFeature(evt.feature)
          return evt
        }),
      observableFromOlEvent(this.$interaction, 'drawend'),
    )
    this.subscribeTo(drawEvents, evt => this.$emit(evt.type, evt))

    const changeEvents = observableFromOlEvent(this.getFeaturesTarget().getAdaptee(), ['add', 'remove'])
    this.subscribeTo(changeEvents, () => {
      ++this.rev
      this.$emit('update:features', this.getFeatures().map(::this.writeFeatureInBindProj))
    })
  }
</script>
