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
      getFillStyleTarget () {
        return {
          setFill: async style => {
            await this.$bgStyleContainer.setBackgroundFill(style)
            ++this.rev
          },
        }
      },
      getStrokeStyleTarget () {
        return {
          setStroke: async style => {
            await this.$bgStyleContainer.setBackgroundStroke(style)
            ++this.rev
          },
        }
      },
    },
  }
</script>
