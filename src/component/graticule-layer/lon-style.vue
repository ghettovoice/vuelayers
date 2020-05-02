<script>
  import { olCmp, stubVNode, textStyleContainer } from '../../mixin'
  import { stubObject } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  export default {
    name: 'VlLayerGraticuleLonStyle',
    mixins: [
      stubVNode,
      textStyleContainer,
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
        $lonStyleContainer: {
          enumerable: true,
          get: () => this.$services?.lonStyleContainer,
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
          this::textStyleContainer.methods.getServices(),
        )
      },
      getTextStyleTarget () {
        return {
          setText: async style => {
            await this.$lonStyleContainer.setLonLabelStyle(style)
            ++this.rev
          },
        }
      },
    },
  }
</script>
