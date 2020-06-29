<script>
  import { fillStyleContainer, olCmp, strokeStyleContainer, stubVNode } from '../../mixins'
  import { stubObject, mergeDescriptors } from '../../utils'

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
        const obj = stubObject()
        obj.id = this.currentId

        return obj
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
