<script>
  import debounce from 'debounce-promise'
  import { Collection } from 'ol'
  import RotateInteraction from 'ol-rotate-feature'
  import { always } from 'ol/events/condition'
  import { Vector as VectorSource } from 'ol/source'
  import { merge as mergeObs } from 'rxjs'
  import { map as mapObs } from 'rxjs/operators'
  import { FRAME_TIME, interaction, styleContainer } from '../../mixin'
  import { roundPointCoords } from '../../ol-ext'
  import { fromOlEvent as obsFromOlEvent } from '../../rx-ext'
  import { assert, instanceOf } from '../../util/assert'
  import { clonePlainObject, isEqual, isFunction, map } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import { makeWatchers } from '../../util/vue-helpers'

  export default {
    name: 'VlInteractionRotate',
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
      angle: {
        type: Number,
        default: 0,
      },
      anchor: {
        type: Array,
        validator: val => val.length >= 2,
      },
      condition: {
        type: Function,
        default: always,
      },
      allowAnchorMovement: {
        type: Boolean,
        default: true,
      },
    },
    computed: {
      anchorDataProj () {
        if (!this.anchor) return

        return roundPointCoords(this.anchor)
      },
      anchorViewProj () {
        if (!this.anchor) return

        return this.pointToViewProj(this.anchor)
      },
      currentAnchorDataProj () {
        if (this.rev && this.$interaction) {
          return this.getAnchorInternal()
        }
        return this.anchorDataProj
      },
      currentAnchorViewProj () {
        if (this.rev && this.$interaction) {
          return this.getAnchorInternal(true)
        }
        return this.anchorViewProj
      },
      currentAngle () {
        if (this.rev && this.$interaction) {
          return this.getAngleInternal()
        }
        return this.angle
      },
    },
    watch: {
      anchorDataProj: {
        deep: true,
        async handler (value) {
          await this.setAnchor(value)
        },
      },
      currentAnchorDataProj: {
        deep: true,
        handler: /*#__PURE__*/debounce(function (value) {
          if (isEqual(value, this.anchorDataProj)) return

          this.$emit('update:anchor', clonePlainObject(value))
        }, FRAME_TIME),
      },
      async angle (value) {
        await this.setAngle(value)
      },
      currentAngle: /*#__PURE__*/debounce(function (value) {
        if (value === this.angle) return

        this.$emit('update:angle', value)
      }, FRAME_TIME),
      .../*#__PURE__*/makeWatchers([
        'source',
      ], prop => async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    methods: {
      /**
       * @return {Promise<Modify>}
       * @protected
       */
      async createInteraction () {
        const source = this._source = await this.getInstance(this.source)
        assert(!!source, `Source "${this.source}" not found in identity map.`)

        let features
        if (source instanceof VectorSource) {
          features = source.getFeaturesCollection()
          instanceOf(features, Collection, `Source "${this.source}" doesn't provide features collection.`)
        } else {
          if (isFunction(source.getFeaturesCollection)) {
            features = source.getFeaturesCollection()
          } else if (isFunction(source.getFeatures)) {
            features = source.getFeatures()
          }
          instanceOf(features, Collection, `Source "${this.source}" doesn't provide features collection.`)
        }

        return new RotateInteraction({
          features,
          angle: this.currentAngle,
          anchor: this.currentAnchorViewProj,
          allowAnchorMovement: this.allowAnchorMovement,
          condition: this.condition,
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
          setStyle: async () => {
            if (process.env.VUELAYERS_DEBUG) {
              this.$logger.log('style changed, scheduling recreate...')
            }

            await this.scheduleRecreate()
          },
        }
      },
      async getAngle () {
        await this.resolveInteraction()

        return this.getAngleInternal()
      },
      getAngleInternal () {
        return this.$interaction.getAngle()
      },
      async setAngle (angle) {
        (await this.resolveInteraction()).setAngle(angle)
      },
      async getAnchor (viewProj = false) {
        await this.resolveInteraction()

        return this.getAnchorInternal(viewProj)
      },
      getAnchorInternal (viewProj = false) {
        const anchor = this.$interaction.getAnchor()
        if (viewProj) {
          return roundPointCoords(anchor)
        }

        return this.pointToDataProj(anchor)
      },
      async setAnchor (anchor, viewProj = false) {
        if (isEqual(anchor, await this.getAnchor(viewProj))) return
        if (!viewProj) {
          anchor = this.pointToViewProj(anchor)
        }
        (await this.resolveInteraction()).setAnchor(anchor)
      },
    },
  }

  /**
   * @private
   */
  function subscribeToInteractionChanges () {
    const vm = this
    const start = obsFromOlEvent(this.$interaction, 'rotatestart')
    const end = obsFromOlEvent(this.$interaction, 'rotateend')
    const progress = obsFromOlEvent(this.$interaction, 'rotating')
    const events = mergeObs(start, end, progress).pipe(
      mapObs(({ type, features, angle, anchor }) => ({
        type,
        features: features instanceof Collection ? features.getArray() : features,
        angle,
        anchor: vm.pointToDataProj(anchor),
        get json () {
          if (!this._json) {
            this._json = map(this.features, feature => vm.writeFeatureInDataProj(feature))
          }
          return this._json
        },
      })),
    )
    this.subscribeTo(events, evt => {
      ++this.rev

      this.$emit(evt.type, evt)
    })
  }
</script>
