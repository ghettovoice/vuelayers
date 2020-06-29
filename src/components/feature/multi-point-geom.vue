<script>
  import { MultiPoint } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixins'
  import { constant } from '../../utils'

  export default {
    name: 'VlGeomMultiPoint',
    mixins: [
      simpleGeometry,
    ],
    computed: {
      type: /*#__PURE__*/constant(GeometryType.MULTI_POINT),
    },
    methods: {
      /**
       * @returns {MultiPoint}
       * @protected
       */
      createGeometry () {
        return new MultiPoint(this.currentCoordinatesViewProj)
      },
    },
  }
</script>
