<script>
  import { Point } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixins'
  import { isPointCoords } from '../../ol-ext'
  import { assert, constant } from '../../utils'

  export default {
    name: 'VlGeomPoint',
    mixins: [
      simpleGeometry,
    ],
    props: {
      /* eslint-disable vue/require-prop-types */
      coordinates: {
        ...simpleGeometry.props.coordinates,
        validator: isPointCoords,
      },
      /* eslint-enable vue/require-prop-types */
    },
    computed: {
      type: /*#__PURE__*/constant(GeometryType.POINT),
    },
    methods: {
      /**
       * @return {Point}
       * @protected
       */
      createGeometry () {
        return new Point(this.currentCoordinatesViewProj)
      },
      /**
       * @param {number[]} coordinates
       * @param {boolean} [viewProj=false]
       */
      setCoordinates (coordinates, viewProj = false) {
        assert(isPointCoords(coordinates), 'Invalid coordinates')

        this::simpleGeometry.methods.setCoordinates(coordinates, viewProj)
      },
    },
  }
</script>
