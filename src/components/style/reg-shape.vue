<script>
  import { RegularShape as RegularShapeStyle } from 'ol/style'
  import { regShapeStyle } from '../../mixins'

  export default {
    name: 'VlStyleRegShape',
    mixins: [
      regShapeStyle,
    ],
    methods: {
      /**
       * @return {RegularShapeStyle}
       * @protected
       */
      createStyle () {
        return new RegularShapeStyle({
          // ol/style/Image
          rotation: this.currentRotation,
          rotateWithView: this.currentRotateWithView,
          displacement: this.inputDisplacement,
          // ol/style/RegularShape
          points: this.points,
          radius: this.radius,
          radius1: this.radius1,
          radius2: this.radius2,
          angle: this.angle,
          fill: this.$fill,
          stroke: this.$stroke,
        })
      },
    },
  }
</script>
