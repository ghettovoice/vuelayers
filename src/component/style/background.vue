<script>
  import { fillStyleContainer, olCmp, strokeStyleContainer, stubVNode } from '../../mixin'
  import { stubObject } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  export default {
    name: 'VlStyleBackground',
    mixins: [
      stubVNode,
      fillStyleContainer,
      strokeStyleContainer,
      olCmp,
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
    created () {
      Object.defineProperties(this, {
        $bgStyleContainer: {
          enumerable: true,
          get: () => this.$services?.bgStyleContainer,
        },
      })
    },
    methods: {
      getFill () {
        return this.$bgStyleContainer.getBackgroundFill()
      },
      async setFill (fill) {
        await this.$bgStyleContainer.setBackgroundFill(fill)
      },
      getStroke () {
        return this.$bgStyleContainer.getBackgroundStroke()
      },
      async setStroke (stroke) {
        await this.$bgStyleContainer.setBackgroundStroke(stroke)
      },
      createOlObject () {
        return stubObject()
      },
      getServices () {
        return mergeDescriptors(
          this::olCmp.methods.getServices(),
          this::fillStyleContainer.methods.getServices(),
          this::strokeStyleContainer.methods.getServices(),
        )
      },
    },
  }
</script>
