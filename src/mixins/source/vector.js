import ol from 'openlayers'
import source from 'vuelayers/src/mixins/source/source'
import { coord as coordHelper } from 'vuelayers/src/ol'

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
        self.$emit('load', {
          features,
          extent,
          resolution,
          projection
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
  mixins: [ source ],
  props,
  methods
}
