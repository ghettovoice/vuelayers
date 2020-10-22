<script>
  import { MultiLineString } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixins'
  import { isMultiLineCoords } from '../../ol-ext'
  import { assert, constant } from '../../utils'

  export default {
    name: 'VlGeomMultiLineString',
    mixins: [
      simpleGeometry,
    ],
    props: {
      /* eslint-disable vue/require-prop-types */
      coordinates: {
        ...simpleGeometry.props.coordinates,
        validator: isMultiLineCoords,
      },
      /* eslint-enable vue/require-prop-types */
    },
    computed: {
      type: /*#__PURE__*/constant(GeometryType.MULTI_LINE_STRING),
    },
    methods: {
      /**
       * @returns {MultiLineString}
       * @protected
       */
      createGeometry () {
        return new MultiLineString(this.currentCoordinatesViewProj)
      },
      /**
       * @param {number[]} coordinates
       * @param {boolean} [viewProj=false]
       */
      setCoordinates (coordinates, viewProj = false) {
        assert(isMultiLineCoords(coordinates), 'Invalid coordinates')

        this::simpleGeometry.methods.setCoordinates(coordinates, viewProj)
      },
    },
  }
</script>
