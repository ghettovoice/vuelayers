<script>
  import { MultiPolygon } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixin'
  import { constant } from '../../util/minilo'

  export default {
    name: 'VlGeomMultiPolygon',
    mixins: [
      simpleGeometry,
    ],
    computed: {
      type: constant(GeometryType.MULTI_POLYGON),
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
