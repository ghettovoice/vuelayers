<script>
  import { olCmp, stubVNode, strokeStyleContainer } from '../../mixin'
  import { stubObject } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

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
        return stubObject()
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
