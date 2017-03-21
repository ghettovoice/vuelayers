<script>
  import Icon from 'ol/style/icon'
  import imageStyle from 'vl-components/style/image'

  const props = {
    src: {
      type: String,
      required: true
    },
    size: {
      type: Array,
      validator: value => Array.isArray(value) && value.length === 2
    },
    anchor: {
      type: Array,
      default: () => [ 0.5, 0.5 ]
    },
    anchorOrigin: {
      type: String,
      default: 'top-left' // bottom-left, bottom-right, top-left or top-right
    },
    anchorXUnits: {
      type: String,
      default: 'fraction' // pixels, fraction
    },
    anchorYUnits: {
      type: String,
      default: 'fraction' // pixels, fraction
    },
    color: Array,
    crossOrigin: {
      type: String,
      default: 'anonymous'
    },
    offset: {
      type: Array,
      default: () => [ 0, 0 ]
    },
    offsetOrigin: {
      type: String,
      default: 'top-left' // bottom-left, bottom-right, top-left or top-right
    },
    opacity: {
      type: Number,
      default: 1
    },
    scale: {
      type: Number,
      default: 1
    },
    snapToPixel: {
      type: Boolean,
      default: true
    },
    rotateWithView: {
      type: Boolean,
      default: false
    },
    rotation: {
      type: Number,
      default: 0
    }
  }

  const methods = {
    /**
     * @return {Icon}
     * @protected
     */
    createStyle () {
      return new Icon({
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
        snapToPixel: this.snapToPixel,
        rotateWithView: this.rotateWithView,
        rotation: this.rotation,
        size: this.size,
        src: this.src
      })
    }
  }
  // todo other watchers
  const watch = {
    src () {
      this.refresh()
    },
    size () {
      this.refresh()
    },
    anchor () {
      this.refresh()
    },
    scale () {
      this.refresh()
    }
  }

  export default {
    name: 'vl-style-icon',
    mixins: [ imageStyle ],
    props,
    methods,
    watch
  }
</script>

<style>/* stub styles */</style>
