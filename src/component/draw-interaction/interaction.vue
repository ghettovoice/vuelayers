<script>
  /**
   * @module draw-interaction/interaction
   */
  import { GEOMETRY_TYPE } from '../../ol-ext/consts'
  import interaction from '../../mixin/interaction'
  import featuresContainer from '../../mixin/features-container'
  import stylesContainer from '../../mixin/styles-container'

  // TODO bind with external destination source
  /**
   * @vueProps
   */
  const props = {
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
  const methods = {}

  /**
   * @alias module:draw-interaction/interaction
   * @title vl-interaction-draw
   * @vueProto
   */
  export default {
    name: 'vl-interaction-draw',
    mixins: [interaction, featuresContainer, stylesContainer],
    props,
    methods,
  }
</script>
