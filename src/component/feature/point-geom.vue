<script>
  import { Point } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixin'
  import { constant } from '../../util/minilo'

  export default {
    name: 'VlGeomPoint',
    mixins: [
      simpleGeometry,
    ],
    props: {
      coordinates: {
        type: Array,
        required: true,
        validator: value => value.length >= 2,
      },
    },
    computed: {
      type: constant(GeometryType.POINT),
    },
    methods: {
      /**
       * @return {Point}
       * @protected
       */
      createGeometry () {
        return new Point(this.currentCoordinatesViewProj)
      },
    },
  }
</script>
