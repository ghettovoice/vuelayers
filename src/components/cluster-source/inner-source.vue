<script>
  import { olCmp, sourceContainer, stubVNode } from '../../mixins'
  import { getSourceId } from '../../ol-ext'
  import { clonePlainObject, isEqual, mergeDescriptors, stubObject } from '../../utils'

  export default {
    name: 'VlSourceInnerAdapter',
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
    computed: {
      source () {
        if (!(this.rev && this.$source)) return

        return {
          id: getSourceId(this.$source),
          type: this.$source.constructor.name,
        }
      },
    },
    watch: {
      source: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:source', value && clonePlainObject(value))
        },
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
      getServices () {
        return mergeDescriptors(
          this::olCmp.methods.getServices(),
          this::sourceContainer.methods.getServices(),
        )
      },
      getSourceTarget () {
        return {
          getSource: () => this.$innerSourceContainer?.getInnerSource(),
          setSource: source => this.$innerSourceContainer?.setInnerSource(source),
        }
      },
    },
  }
</script>
