<script>
  import { Collection } from 'ol'
  import { altKeyOnly, always, primaryAction } from 'ol/events/condition'
  import { Modify as ModifyInteraction } from 'ol/interaction'
  import { Vector as VectorSource } from 'ol/source'
  import { merge as mergeObs } from 'rxjs'
  import { map as mapObs, tap } from 'rxjs/operators'
  import { interaction, makeChangeOrRecreateWatchers, styleContainer } from '../../mixins'
  import { COORD_PRECISION, writeGeoJsonFeature } from '../../ol-ext'
  import { fromOlEvent as obsFromOlEvent } from '../../rx-ext'
  import { assert, instanceOf, isFunction, map, mergeDescriptors } from '../../utils'

  export default {
    name: 'VlInteractionModify',
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
    watch: {
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'source',
        'condition',
        'deleteCondition',
        'insertVertexCondition',
        'pixelTolerance',
        'wrapX',
      ]),
    },
    methods: {
      /**
       * @return {Promise<Modify>}
       * @protected
       */
      async createInteraction () {
        let source = this._source = await this.getInstance(this.source)
        assert(!!source, `Source "${this.source}" not found in identity map.`)

        let features
        if (source instanceof VectorSource) {
          features = source.getFeaturesCollection()
          if (features) {
            instanceOf(features, Collection, `Source "${this.source}" doesn't provide features collection.`)
            source = null
          }
        } else {
          if (isFunction(source.getFeaturesCollection)) {
            features = source.getFeaturesCollection()
          } else if (isFunction(source.getFeatures)) {
            features = source.getFeatures()
          }
          instanceOf(features, Collection, `Source "${this.source}" doesn't provide features collection.`)
          source = null
        }

        return new ModifyInteraction({
          source,
          features,
          condition: this.condition,
          deleteCondition: this.deleteCondition,
          insertVertexCondition: this.insertVertexCondition,
          pixelTolerance: this.pixelTolerance,
          wrapX: this.wrapX,
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
      async getPointerCount () {
        return (await this.resolveInteraction()).getPointerCount()
      },
      async removePoint () {
        return (await this.resolveInteraction()).removePoint()
      },
    },
  }

  /**
   * @private
   */
  function subscribeToInteractionChanges () {
    let modifying
    const start = obsFromOlEvent(this.$interaction, 'modifystart').pipe(
      tap(evt => {
        this.setInteracting(true)
        modifying = []
        evt.features.forEach(feature => {
          modifying[feature.getId()] = feature.getRevision()
        })
      }),
    )
    const end = obsFromOlEvent(this.$interaction, 'modifyend').pipe(
      mapObs(evt => ({
        ...evt,
        modified: evt.features.getArray().reduce((modified, feature, idx) => {
          if (modifying[feature.getId()] !== feature.getRevision()) {
            modified[idx] = feature.getId()
          }
          return modified
        }, {}),
      })),
      tap(() => this.setInteracting(false)),
    )
    const events = mergeObs(start, end).pipe(
      mapObs(({ type, features, modified }) => {
        const viewProj = this.resolvedViewProjection
        const dataProj = this.resolvedDataProjection
        return {
          type,
          features: features instanceof Collection ? features.getArray() : features,
          modified: modified || {},
          get json () {
            if (!this._json) {
              this._json = map(this.features, feature => writeGeoJsonFeature(feature, viewProj, dataProj, COORD_PRECISION))
            }
            return this._json
          },
        }
      }),
    )
    this.subscribeTo(events, evt => this.$emit(evt.type, evt))
  }
</script>
