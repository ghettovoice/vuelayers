<script>
  import { LineString } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { simpleGeometry } from '../../mixin'
  import { constant } from '../../util/minilo'

  export default {
    name: 'VlGeomLineString',
    mixins: [
      simpleGeometry,
    ],
    computed: {
      type: constant(GeometryType.LINE_STRING),
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
