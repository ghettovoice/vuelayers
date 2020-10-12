<script>
  import { olCmp, stubVNode, textStyleContainer } from '../../mixins'
  import { stubObject, mergeDescriptors } from '../../utils'

  export default {
    name: 'VlLayerGraticuleLatStyle',
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
        $latStyleContainer: {
          enumerable: true,
          get: () => this.$services?.latStyleContainer,
        },
      })
    },
    methods: {
      createOlObject () {
        const obj = stubObject()
        obj.id = this.currentId

        return obj
      },
      refresh () {
        ++this.rev
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
            await this.$latStyleContainer.setLatLabelStyle(style)
            await this.scheduleRefresh()
          },
        }
      },
    },
  }
</script>
