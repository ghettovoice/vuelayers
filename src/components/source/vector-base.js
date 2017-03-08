import ol from 'openlayers'
import source from 'vl-components/source/source'
import virtSlot from 'vl-mixins/virt-slot'
import { coord as coordHelper } from 'vl-ol'

const props = {
  loader: Function,
  useSpatialIndex: {
    type: Boolean,
    default: true
  }
  // todo implement options
  // format: String,
  // strategy: String
}

const methods = {
  /**
   * @return {function|undefined}
   * @protected
   */
  sourceLoader () {
    if (!this.loader) return

    const loader = this.loader.bind(this)
    const self = this

    return async function __loader (extent, resolution, projection) {
      projection = projection.getCode()
      extent = coordHelper.extentToLonLat(extent, projection)

      const features = await Promise.resolve(loader(extent, resolution, projection))

      if (features && features.length) {
        self.$nextTick(() => {
          self.$emit('load', {
            features,
            extent,
            resolution,
            projection
          })
        })
      }
    }
  },
  createSource () {
    return new ol.source.Vector({
      attributions: this.attributions,
      projection: this.projection,
      loader: this.sourceLoader(),
      useSpatialIndex: this.useSpatialIndex,
      wrapX: this.wrapX,
      logo: this.logo,
      strategy: ol.loadingstrategy.bbox
      // url: this.url,
    })
  }
}

export default {
  mixins: [ source, virtSlot ],
  props,
  methods,
  virtSlot: {
    slots: [ 'default' ]
  },
  stubVNode: {
    empty: false,
    slots: false,
    attrs () {
      return {
        id: this.$options.name
      }
    }
  }
}
