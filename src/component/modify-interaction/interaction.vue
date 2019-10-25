<script>
  import { altKeyOnly, always, primaryAction } from 'ol/events/condition'
  import { Collection } from 'ol'
  import { Modify as ModifyInteraction } from 'ol/interaction'
  import { Vector as VectorSource } from 'ol/source'
  import { interaction, stylesContainer } from '../../mixin'
  import { createStyle, defaultEditStyle } from '../../ol-ext'
  import { observableFromOlEvent } from '../../rx-ext'
  import { hasInteraction, instanceOf } from '../../util/assert'
  import { mapValues } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import { makeWatchers } from '../../util/vue-helpers'

  /**
   * @vueProto
   * @alias module:modify-interaction/interaction
   * @title vl-interaction-modify
   */
  export default {
    name: 'vl-interaction-modify',
    mixins: [interaction, stylesContainer],
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.vmId,
          class: this.cmpName,
        }
      },
    },
    props: {
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
       * @type {function|undefined}
       */
      condition: {
        type: Function,
        default: primaryAction,
      },
      /**
       * A function that takes an `ol.MapBrowserEvent` and returns a boolean to indicate whether that event should be handled.
       * By default, `ol.events.condition.singleClick` with `ol.events.condition.altKeyOnly` results in a vertex deletion.
       * @type {function|undefined}
       */
      deleteCondition: {
        type: Function,
        default: altKeyOnly,
      },
      /**
       * A function that takes an `ol.MapBrowserEvent` and returns a boolean to indicate whether a new vertex can be added
       * to the sketch features. Default is `ol.events.condition.always`.
       * @type {function|undefined}
       */
      insertVertexCondition: {
        type: Function,
        default: always,
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
    },
    methods: {
      /**
       * @return {Promise<Modify>}
       * @protected
       */
      async createInteraction () {
        let source = await this.getInstance(this.source)
        instanceOf(source, VectorSource, `Source "${this.source}" doesn't exists in the identity map.`)
        instanceOf(source.getFeaturesCollection(), Collection, `Source "${this.source}" doesn't provide features collection.`)

        return new ModifyInteraction({
          features: source.getFeaturesCollection(),
          deleteCondition: this.deleteCondition,
          insertVertexCondition: this.insertVertexCondition,
          pixelTolerance: this.pixelTolerance,
          style: this.createStyleFunc(),
          wrapX: this.wrapX,
        })
      },
      /**
       * @return {function(feature: Feature): Style}
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
       * @return {Interaction|undefined}
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
       * @param {Array<{style: Style, condition: (function|boolean|undefined)}>|function(feature: Feature): Style|Vue|undefined} styles
       * @return {void}
       * @protected
       */
      setStyle (styles) {
        if (styles !== this._styles) {
          this._styles = styles
          this.scheduleRecreate()
        }
      },
      /**
       * @return {void}
       * @protected
       */
      subscribeAll () {
        this::interaction.methods.subscribeAll()
        this::subscribeToInteractionChanges()
      },
    },
    watch: {
      ...makeWatchers([
        'source',
        'condition',
        'deleteCondition',
        'insertVertexCondition',
        'pixelTolerance',
        'wrapX',
      ], () => function () {
        this.scheduleRecreate()
      }),
    },
  }

  /**
   * @private
   */
  function subscribeToInteractionChanges () {
    hasInteraction(this)

    const modifyEvents = observableFromOlEvent(this.$interaction, ['modifystart', 'modifyend'])
    this.subscribeTo(modifyEvents, evt => {
      ++this.rev

      this.$nextTick(() => {
        this.$emit(evt.type, evt)
      })
    })
  }
</script>
