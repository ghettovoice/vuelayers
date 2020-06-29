<script>
  import { LineString } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixins'
  import { constant } from '../../utils'

  export default {
    name: 'VlGeomLineString',
    mixins: [
      simpleGeometry,
    ],
    props: {
      coordinates: {
        type: Array,
        required: true,
        // validator: value => every(value, point => isArray(point) && point.length >= 2),
      },
    },
    computed: {
      type: /*#__PURE__*/constant(GeometryType.LINE_STRING),
    },
    methods: {
      /**
       * @returns {LineString}
       * @protected
       */
      createGeometry () {
        return new LineString(this.currentCoordinatesViewProj)
      },
    },
  }
</script>
