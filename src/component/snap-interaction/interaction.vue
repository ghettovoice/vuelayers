<script>
  import SnapInteraction from 'ol/interaction/Snap'
  import interaction from '../../mixin/interaction'
  import { makeWatchers } from '../../util/vue-helpers'

  /**
   * @vueProps
   */
  const props = {
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
  }

  /**
   * @vueMethods
   */
  const methods = {
    /**
     * @return {Promise<Snap>}
     * @protected
     */
    async createInteraction () {
      let sourceIdent = this.makeIdent(this.source)
      let source = await this.$identityMap.get(sourceIdent, this.$options.INSTANCE_PROMISE_POOL)

      return new SnapInteraction({
        source: source,
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
  }

  const watch = makeWatchers(['source'], () => function () {
    this.scheduleRecreate()
  })

  /**
   * @alias module:snap-interaction/interaction
   * @title vl-interaction-snap
   * @vueProto
   */
  export default {
    name: 'vl-interaction-snap',
    mixins: [interaction],
    props,
    methods,
    watch,
  }
</script>
