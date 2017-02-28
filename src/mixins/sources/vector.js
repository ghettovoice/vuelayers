import ol from 'openlayers'
import source from 'vuelayers/src/mixins/sources/source'
import { helpers as olHelpers } from 'vuelayers/src/ol'

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

    return async function __loader (extent, resolution, projection) {
      projection = projection.getCode()
      extent = olHelpers.extentToLonLat(extent, projection)

      const features = await Promise.resolve(loader(extent, resolution, projection))
      // todo продумать как добавлять дозагруженные объекты, либо сам сорс, либо внешний код добавляет как детей
      if (features && features.length) {
        this.$emit('load', {
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
  name: 'vl-vector-source',
  mixins: [ source ],
  props,
  methods
}
