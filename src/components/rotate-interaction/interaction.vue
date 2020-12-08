<script>
  import { Collection } from 'ol'
  import RotateInteraction from 'ol-rotate-feature'
  import { always } from 'ol/events/condition'
  import { Vector as VectorSource } from 'ol/source'
  import VectorEventType from 'ol/source/VectorEventType'
  import { merge as mergeObs } from 'rxjs'
  import { map as mapObs, tap } from 'rxjs/operators'
  import { interaction, makeChangeOrRecreateWatchers, styleContainer } from '../../mixins'
  import { COORD_PRECISION, isPointCoords, roundPointCoords, writeGeoJsonFeature } from '../../ol-ext'
  import { fromOlChangeEvent as obsFromOlChangeEvent, fromOlEvent as obsFromOlEvent } from '../../rx-ext'
  import {
    addPrefix,
    assert,
    coalesce,
    instanceOf,
    isEqual,
    isFunction,
    isNumber,
    map,
    mergeDescriptors,
  } from '../../utils'

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
    data () {
      return {
        currentAnchorViewProj: roundPointCoords(this.anchor),
        currentAngle: this.angle,
      }
    },
    computed: {
      anchorDataProj () {
        return roundPointCoords(this.anchor)
      },
      anchorViewProj () {
        return this.pointToViewProj(this.anchor)
      },
      currentAnchorDataProj () {
        return this.pointToDataProj(this.currentAnchorViewProj)
      },
    },
    watch: {
      rev () {
        if (!this.$interaction) return

        if (!isEqual(this.currentAnchorViewProj, this.$interaction.getAnchor())) {
          this.currentAnchorViewProj = this.$interaction.getAnchor()
        }
        if (this.currentAngle !== this.$interaction.getAngle()) {
          this.currentAngle = this.$interaction.getAngle()
        }
      },
      anchorViewProj: {
        deep: true,
        handler (value) {
          if (!value) return

          this.setAnchor(value, true)
        },
      },
      currentAnchorDataProj: {
        deep: true,
        handler (value) {
          if (isEqual(value, this.anchorDataProj)) return

          this.$emit('update:anchor', value?.slice())
        },
      },
      angle (value) {
        this.setAngle(value)
      },
      currentAngle (value) {
        if (value === this.angle) return

        this.$emit('update:angle', value)
      },
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'source',
        'condition',
        'allowAnchorMovement',
      ]),
    },
    created () {
      this.currentAnchorViewProj = this.anchorViewProj?.slice()
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
          if (!features) {
            features = new Collection(source.getFeatures())
            this.subscribeTo(
              obsFromOlEvent(source, VectorEventType.ADDFEATURE),
              ({ feature }) => feature && features.push(feature),
            )
            this.subscribeTo(
              obsFromOlEvent(source, VectorEventType.REMOVEFEATURE),
              ({ feature }) => feature && features.remove(feature),
            )
          }
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
      getAngle () {
        return coalesce(this.$interaction?.getAngle(), this.currentAngle)
      },
      setAngle (angle) {
        assert(isNumber(angle), 'Invalid angle')

        if (angle !== this.currentAngle) {
          this.currentAngle = angle
        }
        if (this.$interaction && angle !== this.$interaction.getAngle()) {
          this.$interaction.setAngle(angle)
        }
      },
      getAnchor (viewProj = false) {
        const anchor = coalesce(this.$interaction?.getAnchor(), this.currentAnchorViewProj)

        return viewProj ? roundPointCoords(anchor) : this.pointToDataProj(anchor)
      },
      setAnchor (anchor, viewProj = false) {
        assert(isPointCoords(anchor), 'Invalid anchor')
        anchor = viewProj ? roundPointCoords(anchor) : this.pointToViewProj(anchor)

        if (!isEqual(anchor, this.currentAnchorViewProj)) {
          this.currentAnchorViewProj = anchor
        }
        if (this.$interaction && !isEqual(anchor, this.$interaction.getAnchor())) {
          this.$interaction.setAnchor(anchor)
        }
      },
    },
  }

  /**
   * @private
   */
  function subscribeToInteractionChanges () {
    const setterKey = addPrefix('set')
    const propChanges = obsFromOlChangeEvent(this.$interaction, [
      'angle',
      'anchor',
    ], true, evt => ({
      ...evt,
      setter: val => {
        const args = [val]
        if (evt.prop === 'anchor') {
          args.push(true)
        }
        this[setterKey(evt.prop)](...args)
      },
    }))
    this.subscribeTo(propChanges, ({ setter, value }) => setter(value))

    const start = obsFromOlEvent(this.$interaction, 'rotatestart').pipe(
      tap(() => this.setInteracting(true)),
    )
    const end = obsFromOlEvent(this.$interaction, 'rotateend').pipe(
      tap(() => this.setInteracting(false)),
    )
    const progress = obsFromOlEvent(this.$interaction, 'rotating')
    const events = mergeObs(start, end, progress).pipe(
      mapObs(({ type, features, angle, anchor }) => {
        const viewProj = this.resolvedViewProjection
        const dataProj = this.resolvedDataProjection
        return {
          type,
          features: features instanceof Collection ? features.getArray() : features,
          angle,
          anchor: this.pointToDataProj(anchor),
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
