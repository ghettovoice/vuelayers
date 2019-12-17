<script>
  import Point from 'ol/geom/Point'
  import { geometry } from '../../mixin'
  import { GEOMETRY_TYPE } from '../../ol-ext'
  import { constant } from '../../util/minilo'

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => value.length >= 2,
    },
  }

  const computed = {
    type: constant(GEOMETRY_TYPE.POINT),
  }

  const methods = {
    /**
     * @return {Point}
     * @protected
     */
    createGeometry () {
      return new Point(this.toViewProj(this.coordinates))
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
