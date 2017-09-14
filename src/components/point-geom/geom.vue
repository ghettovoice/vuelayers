<script>
  import { constant } from 'lodash/fp'
  import Point from 'ol/geom/point'
  import { ol as vlol, mixins } from '../../core'

  const { GEOMETRY_TYPE } = vlol
  const { geometry } = mixins

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => value.length === 2,
    },
  }

  const computed = {
    type: constant(GEOMETRY_TYPE.POINT),
  }

  const methods = {
    /**
     * @return {ol.geom.Point}
     * @protected
     */
    createGeometry () {
      return new Point(this.fromLonLat(this.coordinates))
    },
  }

  export default {
    name: 'vl-geom-point',
    mixins: [geometry],
    props,
    computed,
    methods,
  }
</script>
