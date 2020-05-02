<script>
  import { MultiPoint } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixin'
  import { constant } from '../../util/minilo'

  export default {
    name: 'VlGeomMultiPoint',
    mixins: [
      simpleGeometry,
    ],
    computed: {
      type: constant(GeometryType.MULTI_POINT),
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
