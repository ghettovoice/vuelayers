<script>
  import { Polygon } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixin'
  import { constant } from '../../util/minilo'

  export default {
    name: 'VlGeomPolygon',
    mixins: [
      simpleGeometry,
    ],
    computed: {
      type: constant(GeometryType.POLYGON),
    },
    methods: {
      /**
       * @returns {Polygon}
       * @protected
       */
      createGeometry () {
        return new Polygon(this.currentCoordinatesViewProj)
      },
    },
  }
</script>
