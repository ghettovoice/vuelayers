<script>
  import { MultiPoint } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixins'
  import { isMultiPointCoords } from '../../ol-ext'
  import { assert, constant } from '../../utils'

  export default {
    name: 'VlGeomMultiPoint',
    mixins: [
      simpleGeometry,
    ],
    props: {
      /* eslint-disable vue/require-prop-types */
      coordinates: {
        ...simpleGeometry.props.coordinates,
        validator: isMultiPointCoords,
      },
      /* eslint-enable vue/require-prop-types */
    },
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
      /**
       * @param {number[]} coordinates
       * @param {boolean} [viewProj=false]
       */
      setCoordinates (coordinates, viewProj = false) {
        assert(isMultiPointCoords(coordinates), 'Invalid coordinates')

        this::simpleGeometry.methods.setCoordinates(coordinates, viewProj)
      },
    },
  }
</script>
