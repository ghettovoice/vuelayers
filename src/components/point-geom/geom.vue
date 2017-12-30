<script>
  import { constant } from 'lodash/fp'
  import Point from 'ol/geom/point'
  import { GEOMETRY_TYPE, geometry } from '../../core'

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
      return new Point(this.fromSourceProj(this.coordinates))
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
