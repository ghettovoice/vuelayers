<script>
  import { fillStyleContainer, strokeStyleContainer, style } from '../../mixin'
  import { stubObject } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  export default {
    mixins: [
      fillStyleContainer,
      strokeStyleContainer,
      style,
    ],
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.$parent.vmId,
          class: this.$parent.vmClass,
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
          this::style.methods.getServices(),
          this::fillStyleContainer.methods.getServices(),
          this::strokeStyleContainer.methods.getServices(),
        )
      },
    },
  }
</script>
