<script>
  import { Collection } from 'ol'
  import { Translate as TranslateInteraction } from 'ol/interaction'
  import { Vector as VectorSource } from 'ol/source'
  import VectorEventType from 'ol/source/VectorEventType'
  import { merge as mergeObs } from 'rxjs'
  import { map as mapObs, tap } from 'rxjs/operators'
  import { interaction, makeChangeOrRecreateWatchers } from '../../mixins'
  import { COORD_PRECISION, getLayerId, writeGeoJsonFeature } from '../../ol-ext'
  import { fromOlEvent as obsFromOlEvent } from '../../rx-ext'
  import { assert, coalesce, instanceOf, isFunction, isNumber, isString, map } from '../../utils'

  export default {
    name: 'VlInteractionTranslate',
    mixins: [
      interaction,
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
      source: {
        type: String,
        required: true,
      },
      layers: [String, Array],
      filter: Function,
      hitTolerance: {
        type: Number,
        default: 0,
      },
    },
    data () {
      return {
        currentHitTolerance: this.hitTolerance,
      }
    },
    computed: {
      inputFilter () {
        if (isFunction(this.filter)) return this.filter

        let layers = this.layers
        if (!layers) return

        if (isString(layers)) layers = [layers]

        return (feature, layer) => layers.includes(getLayerId(layer))
      },
    },
    watch: {
      rev () {
        if (!this.$interaction) return

        if (this.currentHitTolerance !== this.$interaction.getHitTolerance()) {
          this.currentHitTolerance = this.$interaction.getHitTolerance()
        }
      },
      hitTolerance (value) {
        this.setHitTolerance(value)
      },
      currentHitTolerance (value) {
        if (value === this.hitTolerance) return

        this.$emit('update:hitTolerance', value)
      },
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'source',
        'inputFilter',
      ]),
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

        return new TranslateInteraction({
          features,
          filter: this.inputFilter,
          hitTolerance: this.currentHitTolerance,
        })
      },
      /**
       * @return {void}
       * @protected
       */
      subscribeAll () {
        this::interaction.methods.subscribeAll()
        this::subscribeToInteractionChanges()
      },
      getHitTolerance () {
        return coalesce(this.$interaction?.getHitTolerance(), this.currentHitTolerance)
      },
      setHitTolerance (tolerance) {
        assert(isNumber(tolerance), 'Invalid hit tolerance')

        if (tolerance !== this.currentHitTolerance) {
          this.currentHitTolerance = tolerance
        }
        if (this.$interaction && tolerance !== this.$interaction.getHitTolerance()) {
          this.$interaction.setHitTolerance(tolerance)
        }
      },
    },
  }

  /**
   * @private
   */
  function subscribeToInteractionChanges () {
    const start = obsFromOlEvent(this.$interaction, 'translatestart').pipe(
      tap(() => this.setInteracting(true)),
    )
    const end = obsFromOlEvent(this.$interaction, 'translateend').pipe(
      tap(() => this.setInteracting(false)),
    )
    const progress = obsFromOlEvent(this.$interaction, 'translating')
    const events = mergeObs(start, end, progress).pipe(
      mapObs(({ type, features, coordinate, startCoordinate }) => {
        const viewProj = this.resolvedViewProjection
        const dataProj = this.resolvedDataProjection
        return {
          type,
          features: features instanceof Collection ? features.getArray() : features,
          coordinate: this.pointToDataProj(coordinate),
          startCoordinate: this.pointToDataProj(startCoordinate),
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
