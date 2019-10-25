<script>
  import { Snap as SnapInteraction } from 'ol/interaction'
  import { Source } from 'ol/source'
  import { interaction } from '../../mixin'
  import { makeWatchers } from '../../util/vue-helpers'
  import { instanceOf } from '../../util/assert'

  /**
   * @alias module:snap-interaction/interaction
   * @title vl-interaction-snap
   * @vueProto
   */
  export default {
    name: 'vl-interaction-snap',
    mixins: [interaction],
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
      ...makeWatchers(['source'], () => function () {
        this.scheduleRecreate()
      }),
    },
    methods: {
      /**
       * @return {Promise<Snap>}
       * @protected
       */
      async createInteraction () {
        let source = await this.getInstance(this.source)
        instanceOf(source, Source, `Source "${this.source}" doesn't exists in the identity map.`)

        return new SnapInteraction({
          source,
        })
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
       * @return {void}
       * @protected
       */
      subscribeAll () {
      },
    },
  }
</script>
