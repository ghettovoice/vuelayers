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
          points: this.points,
          radius: this.radius,
          radius1: this.radius1,
          radius2: this.radius2,
          angle: this.angle,
          rotation: this.rotation,
          rotateWithView: this.rotateWithView,
          displacement: this.displacement,
          fill: this.$fill,
          stroke: this.$stroke,
        })
      },
    },
  }
</script>
