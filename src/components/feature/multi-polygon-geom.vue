<script>
  import { MultiPolygon } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixins'
  import { isMultiPolygonCoords } from '../../ol-ext'
  import { assert, constant } from '../../utils'

  export default {
    name: 'VlGeomMultiPolygon',
    mixins: [
      simpleGeometry,
    ],
    props: {
      /* eslint-disable vue/require-prop-types */
      coordinates: {
        ...simpleGeometry.props.coordinates,
        validator: isMultiPolygonCoords,
      },
      /* eslint-enable vue/require-prop-types */
    },
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
      /**
       * @param {number[]} coordinates
       * @param {boolean} [viewProj=false]
       */
      setCoordinates (coordinates, viewProj = false) {
        assert(isMultiPolygonCoords(coordinates), 'Invalid coordinates')

        this::simpleGeometry.methods.setCoordinates(coordinates, viewProj)
      },
    },
  }
</script>
