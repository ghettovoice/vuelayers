<script>
  import { MultiLineString } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixin'
  import { constant } from '../../util/minilo'

  export default {
    name: 'VlGeomMultiLineString',
    mixins: [
      simpleGeometry,
    ],
    computed: {
      type: constant(GeometryType.MULTI_LINE_STRING),
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
