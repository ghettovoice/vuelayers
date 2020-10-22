<script>
  import { olCmp, stubVNode, strokeStyleContainer } from '../../mixins'
  import { dumpStrokeStyle } from '../../ol-ext'
  import { stubObject, mergeDescriptors, isEqual, clonePlainObject } from '../../utils'

  export default {
    name: 'VlLayerGraticuleStrokeStyleAdapter',
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
    computed: {
      stroke () {
        if (!(this.rev && this.$stroke)) return

        return dumpStrokeStyle(this.$stroke)
      },
    },
    watch: {
      stroke: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:stroke', value && clonePlainObject(value))
        },
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
          setStroke: style => this.$strokeStyleContainer.setStrokeStyle(style),
          getStroke: () => this.$strokeStyleContainer.getStrokeStyle(),
        }
      },
    },
  }
</script>
