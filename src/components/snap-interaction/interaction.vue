<script>
  import { Collection } from 'ol'
  import { Snap as SnapInteraction } from 'ol/interaction'
  import { Vector as VectorSource } from 'ol/source'
  import { interaction, makeChangeOrRecreateWatchers } from '../../mixins'
  import { assert, instanceOf, isFunction } from '../../utils'

  export default {
    name: 'VlInteractionSnap',
    mixins: [
      interaction,
    ],
    props: {
      /**
       * Target source identifier from IdentityMap.
       * @type {string}
       */
      source: {
        type: String,
        required: true,
      },
      /**
       * Snap to edges
       * @type {boolean}
       */
      edge: {
        type: Boolean,
        default: true,
      },
      /**
       * Snap to vertices.
       * @type {boolean}
       */
      vertex: {
        type: Boolean,
        default: true,
      },
      /**
       * Pixel tolerance for considering the pointer close enough to a segment or vertex for snapping.
       * @type {number}
       */
      pixelTolerance: {
        type: Number,
        default: 10,
      },
    },
    watch: {
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'source',
        'edge',
        'vertex',
        'pixelTolerance',
      ]),
    },
    methods: {
      /**
       * @return {Promise<Snap>}
       * @protected
       */
      async createInteraction () {
        let source = await this.getInstance(this.source)
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

        return new SnapInteraction({
          source,
          features,
          edge: this.edge,
          vertex: this.vertex,
          pixelTolerance: this.pixelTolerance,
        })
      },
    },
  }
</script>
