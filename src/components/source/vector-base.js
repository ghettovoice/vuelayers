import ol from 'openlayers'
import { differenceWith } from 'lodash/fp'
import source from 'vl-components/source/source'
import { coord as coordHelper, feature as featureHelper } from 'vl-ol'

const props = {
  loader: Function,
  useSpatialIndex: {
    type: Boolean,
    default: true
  },
  features: {
    type: Array,
    default: () => []
  }
  // todo implement options
  // format: String,
  // strategy: String
}

const {
  mountSource: sourceMountSource,
  unmountSource: sourceUnmountSource
} = source.methods

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
  },
  mountSource () {
    this::sourceMountSource()

    if (this.features.length) {
      this.source.addFeatures(this.features.map(this::createFeature))
    }
  },
  unmountSource () {
    this::sourceUnmountSource()
    this.source.clear()
  }
}

const diffById = differenceWith((a, b) => a.id === b.id)

const watch = {
  features (value, oldValue) {
    let forAdd = diffById(value, oldValue)
    let forRemove = diffById(oldValue, value)

    this.source.addFeatures(forAdd.map(this::createFeature))
    forRemove.map(plainFeature => {
      this.source.removeFeature(this.source.getFeatureById(plainFeature.id))
    })
  }
}

export default {
  mixins: [ source ],
  props,
  methods,
  watch,
  stubVNode: {
    empty: false,
    attrs () {
      return {
        id: this.$options.name
      }
    }
  }
}

function createFeature (plainFeature) {
  plainFeature.properties || (plainFeature.properties = {})
  plainFeature.properties = {
    ...plainFeature.properties,
    layer: this.layer().get('id')
  }

  return featureHelper.createFeature(plainFeature, this.projection)
}
