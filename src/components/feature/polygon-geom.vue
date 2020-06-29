<script>
  import { Polygon } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixins'
  import { constant } from '../../utils'

  export default {
    name: 'VlGeomPolygon',
    mixins: [
      simpleGeometry,
    ],
    computed: {
      type: /*#__PURE__*/constant(GeometryType.POLYGON),
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
