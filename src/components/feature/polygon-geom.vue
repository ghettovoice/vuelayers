<script>
  import { Polygon } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixins'
  import { isPolygonCoords } from '../../ol-ext'
  import { assert, constant } from '../../utils'

  export default {
    name: 'VlGeomPolygon',
    mixins: [
      simpleGeometry,
    ],
    props: {
      /* eslint-disable vue/require-prop-types */
      coordinates: {
        ...simpleGeometry.props.coordinates,
        validator: isPolygonCoords,
      },
      /* eslint-enable vue/require-prop-types */
    },
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
      /**
       * @param {number[]} coordinates
       * @param {boolean} [viewProj=false]
       */
      setCoordinates (coordinates, viewProj = false) {
        assert(isPolygonCoords(coordinates), 'Invalid coordinates')

        this::simpleGeometry.methods.setCoordinates(coordinates, viewProj)
      },
    },
  }
</script>
