<script>
  import { olCmp, stubVNode, sourceContainer } from '../../mixins'
  import { mergeDescriptors, stubObject } from '../../utils'

  export default {
    name: 'VlSourceInner',
    mixins: [
      stubVNode,
      sourceContainer,
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
        $innerSourceContainer: {
          enumerable: true,
          get: () => this.$services?.innerSourceContainer,
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
          this::sourceContainer.methods.getServices(),
        )
      },
      getSourceTarget () {
        return {
          setSource: async source => {
            await this.$innerSourceContainer.setInnerSource(source)
            await this.scheduleRefresh()
          },
        }
      },
    },
  }
</script>
