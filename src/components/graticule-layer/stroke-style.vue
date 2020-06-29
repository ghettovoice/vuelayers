<script>
  import { olCmp, stubVNode, strokeStyleContainer } from '../../mixin'
  import { stubObject, mergeDescriptors } from '../../util'

  export default {
    name: 'VlLayerGraticuleStrokeStyle',
    mixins: [
      stubVNode,
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
        $strokeStyleContainer: {
          enumerable: true,
          get: () => this.$services?.strokeStyleContainer,
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
          this::strokeStyleContainer.methods.getServices(),
        )
      },
      getStrokeStyleTarget () {
        return {
          setStroke: async style => {
            await this.$strokeStyleContainer.setStrokeStyle(style)
            ++this.rev
          },
        }
      },
    },
  }
</script>
