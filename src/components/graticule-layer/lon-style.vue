<script>
  import { olCmp, stubVNode, textStyleContainer } from '../../mixins'
  import { dumpTextStyle } from '../../ol-ext'
  import { stubObject, mergeDescriptors, isEqual, clonePlainObject } from '../../utils'

  export default {
    name: 'VlLayerGraticuleLonStyleAdapter',
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
    computed: {
      text () {
        if (!(this.rev && this.$text)) return

        return dumpTextStyle(this.$text)
      },
    },
    watch: {
      text: {
        deep: true,
        handler (value, prev) {
          if (!isEqual(value, prev)) return

          this.$emit('update:text', value && clonePlainObject(value))
        },
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
        const obj = stubObject()
        obj.id = this.currentId

        return obj
      },
      getServices () {
        return mergeDescriptors(
          this::olCmp.methods.getServices(),
          this::textStyleContainer.methods.getServices(),
        )
      },
      getTextStyleTarget () {
        return {
          getText: () => this.$lonStyleContainer?.getLonLabelStyle(),
          setText: style => this.$lonStyleContainer?.setLonLabelStyle(style),
        }
      },
    },
  }
</script>
