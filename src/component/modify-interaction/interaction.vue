<script>
  /** @module modify-interaction/interaction */
  import ModifyInteraction from 'ol/interaction/modify'
  import eventCondition from 'ol/events/condition'
  import observableFromOlEvent from '../../rx-ext/from-ol-event'
  import interaction from '../../mixin/interaction'
  import stylesContainer from '../../mixin/styles-container'
  import { defaultEditStyle, createStyle } from '../../ol-ext/style'
  import { isCollection, isVectorSource } from '../../ol-ext/util'
  import { mapValues, isFunction } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import { hasInteraction } from '../../util/assert'
  import { makeWatchers } from '../../util/vue-helpers'

  /**
   * @vueProps
   */
  const props = {
    /**
     * Source or collection identifier from IdentityMap.
     * @type {String}
     */
    source: {
      type: String,
      required: true,
    },
    /**
     * A function that takes an `ol.MapBrowserEvent` and returns a boolean to indicate whether that event will be
     * considered to add or move a vertex to the sketch. Default is `ol.events.condition.primaryAction`.
     * @type {ol.EventsConditionType|function|undefined}
     */
    condition: {
      type: Function,
      default: eventCondition.primaryAction,
    },
    /**
     * A function that takes an `ol.MapBrowserEvent` and returns a boolean to indicate whether that event should be handled.
     * By default, `ol.events.condition.singleClick` with `ol.events.condition.altKeyOnly` results in a vertex deletion.
     * @type {ol.EventsConditionType|function|undefined}
     */
    deleteCondition: {
      type: Function,
      default: eventCondition.altKeyOnly,
    },
    /**
     * A function that takes an `ol.MapBrowserEvent` and returns a boolean to indicate whether a new vertex can be added
     * to the sketch features. Default is `ol.events.condition.always`.
     * @type {ol.EventsConditionType|undefined}
     */
    insertVertexCondition: {
      type: Function,
      default: eventCondition.always,
    },
    /**
     * Pixel tolerance for considering the pointer close enough to a segment or vertex for editing.
     * @type {number}
     */
    pixelTolerance: {
      type: Number,
      default: 10,
    },
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
     * @return {Promise<ol.interaction.Modify>}
     * @protected
     */
    async createInteraction () {
      let sourceIdent = this.makeIdent(this.source)
      let source = await this.$identityMap.get(sourceIdent, this.$options.INSTANCE_PROMISE_POOL)

      if (isFunction(source.getFeatures)) {
        let features = source.getFeatures()
        if (isCollection(features)) {
          source = features
        }
      }

      return new ModifyInteraction({
        source: isVectorSource(source) ? source : undefined,
        features: isCollection(source) ? source : undefined,
        deleteCondition: this.deleteCondition,
        insertVertexCondition: this.insertVertexCondition,
        pixelTolerance: this.pixelTolerance,
        style: this.createStyleFunc(),
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

  const watch = makeWatchers(['source'], function () {
    this.recreate()
  })

  /**
   * @vueProto
   * @alias module:modify-interaction/interaction
   * @title vl-interaction-modify
   */
  export default {
    name: 'vl-interaction-modify',
    mixins: [interaction, stylesContainer],
    props,
    methods,
    watch,
  }

  /**
   * @private
   */
  function subscribeToInteractionChanges () {
    hasInteraction(this)

    const modifyEvents = observableFromOlEvent(this.$interaction, ['modifystart', 'modifyend'])
    this.subscribeTo(modifyEvents, evt => {
      ++this.rev
      this.$emit(evt.type, evt)
    })
  }
</script>
