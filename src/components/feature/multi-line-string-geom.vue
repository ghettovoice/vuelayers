<script>
  import { MultiLineString } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixins'
  import { constant } from '../../utils'

  export default {
    name: 'VlGeomMultiLineString',
    mixins: [
      simpleGeometry,
    ],
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
    },
  }
</script>
