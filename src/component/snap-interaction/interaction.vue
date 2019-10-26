<script>
  import { Snap as SnapInteraction } from 'ol/interaction'
  import { Vector as VectorSource } from 'ol/source'
  import { interaction } from '../../mixin'
  import { instanceOf } from '../../util/assert'
  import { makeWatchers } from '../../util/vue-helpers'

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
      ...makeWatchers([
        'source',
        'edge',
        'vertex',
        'pixelTolerance',
      ], () => interaction.methods.scheduleRecreate),
    },
    methods: {
      /**
       * @return {Promise<Snap>}
       * @protected
       */
      async createInteraction () {
        const source = await this.getInstance(this.source)
        instanceOf(source, VectorSource, `source "${this.source}" is Vector source.`)

        return new SnapInteraction({
          source,
        })
      },
    },
  }
</script>
