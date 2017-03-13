import ol, { coord as coordHelper, feature as featureHelper } from 'vl-ol'
import { diffById } from 'vl-utils/func'
import source from 'vl-components/source/source'

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

const computed = {
  currentLoader () {
    return this.loader
  }
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
    if (!this.currentLoader) return

    const loader = this.currentLoader.bind(this)
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
      attributions: this.currentAttributions,
      projection: this.currentProjection,
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

const watch = {
  features (value, oldValue) {
    let forAdd = diffById(value, oldValue)
    let forRemove = diffById(oldValue, value)

    this.source.addFeatures(forAdd.map(this::createFeature))
    forRemove.map(plainFeature => {
      const feature = this.source.getFeatureById(plainFeature.id)

      if (feature) {
        this.source.removeFeature(feature)
        delete feature.layer
      }
    })
  }
}

export default {
  mixins: [ source ],
  props,
  computed,
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
  // plainFeature.properties || (plainFeature.properties = {})
  // plainFeature.properties = {
  //   ...plainFeature.properties,
  //   layer: this.layer.id
  // }

  const feature = featureHelper.createFeature(plainFeature, this.currentProjection)
  Object.defineProperty(feature, 'layer', {
    enumerable: true,
    configurable: true,
    get: () => this.layer
  })

  return feature
}
