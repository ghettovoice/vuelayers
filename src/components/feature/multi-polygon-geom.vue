<script>
  import { MultiPolygon } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixins'
  import { constant } from '../../utils'

  export default {
    name: 'VlGeomMultiPolygon',
    mixins: [
      simpleGeometry,
    ],
    computed: {
      type: /*#__PURE__*/constant(GeometryType.MULTI_POLYGON),
    },
    methods: {
      /**
       * @returns {MultiPolygon}
       * @protected
       */
      createGeometry () {
        return new MultiPolygon(this.currentCoordinatesViewProj)
      },
    },
  }
</script>
