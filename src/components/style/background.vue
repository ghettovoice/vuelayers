<script>
  import { fillStyleContainer, olCmp, strokeStyleContainer, stubVNode } from '../../mixins'
  import { dumpFillStyle, dumpStrokeStyle } from '../../ol-ext'
  import { clonePlainObject, isEqual, isObjectLike, makeWatchers, mergeDescriptors, stubObject } from '../../utils'

  export default {
    name: 'VlStyleBackgroundAdapter',
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
    computed: {
      stroke () {
        if (!(this.rev && this.$strokeStyle)) return

        return dumpStrokeStyle(this.$strokeStyle)
      },
      fill () {
        if (!(this.rev && this.$fill)) return

        return dumpFillStyle(this.$fill)
      },
    },
    watch: {
      .../*#__PURE__*/makeWatchers([
        'fill',
        'stroke',
      ], prop => function (value, prev) {
        if (isEqual(value, prev)) return

        this.$emit(`update:${prop}`, isObjectLike(value) ? clonePlainObject(value) : value)
      }),
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
          getFill: () => this.$bgStyleContainer?.getBackgroundFill(),
          setFill: style => this.$bgStyleContainer?.setBackgroundFill(style),
        }
      },
      getStrokeStyleTarget () {
        return {
          getStroke: () => this.$bgStyleContainer?.getBackgroundStroke(),
          setStroke: style => this.$bgStyleContainer?.setBackgroundStroke(style),
        }
      },
    },
  }
</script>
