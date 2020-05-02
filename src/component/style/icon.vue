<script>
  import { Icon as IconStyle } from 'ol/style'
  import { imageStyle } from '../../mixin'
  import { normalizeColor } from '../../ol-ext'
  import { assert } from '../../util/assert'
  import { isEmpty, isEqual } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'

  export default {
    name: 'VlStyleIcon',
    mixins: [
      imageStyle,
    ],
    props: {
      src: String,
      size: {
        type: Array,
        validator: val => val.length === 2,
      },
      img: Image,
      imgSize: {
        type: Array,
        validator: val => val.length === 2,
      },
      anchor: {
        type: Array,
        default: () => [0.5, 0.5],
        validator: val => val.length === 2,
      },
      anchorOrigin: {
        type: String,
        default: 'top-left', // bottom-left, bottom-right, top-left or top-right
      },
      anchorXUnits: {
        type: String,
        default: 'fraction', // pixels, fraction
      },
      anchorYUnits: {
        type: String,
        default: 'fraction', // pixels, fraction
      },
      color: [Array, String],
      crossOrigin: String,
      offset: {
        type: Array,
        default: () => [0, 0],
        validator: val => val.length === 2,
      },
      offsetOrigin: {
        type: String,
        default: 'top-left', // bottom-left, bottom-right, top-left or top-right
      },
    },
    computed: {
      parsedColor () {
        return this.color ? normalizeColor(this.color) : undefined
      },
    },
    watch: {
      async anchor (value) {
        await this.setAnchor(value)
      },
      async src (value) {
        if (!isEqual(value, await this.getSrc())) {
          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log('src changed, scheduling recreate...')
          }

          await this.scheduleRecreate()
        }
      },
      async size (value) {
        if (!isEqual(value, await this.getSize())) {
          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log('size changed, scheduling recreate...')
          }

          await this.scheduleRecreate()
        }
      },
      async color (value) {
        if (!isEqual(value, await this.getColor())) {
          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log('color changed, scheduling recreate...')
          }

          await this.scheduleRecreate()
        }
      },
      ...makeWatchers([
        'anchorOrigin',
        'anchorXUnits',
        'anchorYUnits',
        'crossOrigin',
        'offset',
        'offsetOrigin',
        'img',
        'imgSize',
      ], prop => async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    methods: {
      /**
       * @return {Icon}
       * @protected
       */
      createStyle () {
        assert(
          (this.src && !this.img) || (!this.src && this.img),
          "vl-style-icon one of 'image' or 'src' prop must be provided.'",
        )
        assert(
          !this.img || (this.img && !isEmpty(this.imgSize)),
          "vl-style-icon 'imgSize' must be set when image is provided.",
        )

        return new IconStyle({
          anchor: this.anchor,
          anchorOrigin: this.anchorOrigin,
          anchorXUnits: this.anchorXUnits,
          anchorYUnits: this.anchorYUnits,
          color: this.color,
          crossOrigin: this.crossOrigin,
          offset: this.offset,
          offsetOrigin: this.offsetOrigin,
          opacity: this.opacity,
          scale: this.scale,
          rotateWithView: this.rotateWithView,
          rotation: this.rotation,
          size: this.size,
          src: this.src,
          img: this.img,
          imgSize: this.imgSize,
        })
      },
      async getAnchor () {
        return (await this.resolveStyle()).getAnchor()
      },
      async setAnchor (anchor) {
        const style = await this.resolveStyle()

        if (isEqual(anchor, style.getAnchor())) return

        style.setAnchor(anchor)

        await this.scheduleRemount()
      },
      async getColor () {
        return (await this.resolveStyle()).getColor()
      },
      async getImage (pixelRatio) {
        return (await this.resolveStyle()).getImage(pixelRatio)
      },
      async getOrigin () {
        return (await this.resolveStyle()).getOrigin()
      },
      async getSize () {
        return (await this.resolveStyle()).getSize()
      },
      async getSrc () {
        return (await this.resolveStyle()).getSrc()
      },
      async load () {
        (await this.resolveStyle()).load()
      },
    },
  }
</script>
