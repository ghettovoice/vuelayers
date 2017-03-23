import { flow, map, filter } from 'lodash/fp'
import { LAYER_PROP } from 'vl-ol/consts'
import { write } from 'vl-ol/geojson'
import * as styleHelper from 'vl-ol/style'

export default {
  provide () {
    return {
      setStyle: ::this.setStyle,
      getStyle: ::this.getStyle
    }
  },
  beforeCreate () {
    /**
     * @type {Style[]|StyleFunction|undefined}
     */
    this.styles = this.defaultStyles = undefined
  },
  methods: {
    /**
     * Returns styleable OpenLayers object
     *
     * @protected
     */
    styleTarget () { },
    setStyle (style) {
      this.styles = style
      const styleTarget = this.styleTarget()

      if (styleTarget) {
        if (this.styles === null || this.styles) {
          styleTarget.setStyle(createStyleFunc(this))
        } else {
          styleTarget.setStyle(undefined)
        }
      }
    },
    getStyle () {
      return this.styles
    }
  }
}

export function createStyleFunc (vm) {
  return function __styleTargetStyleFunc (feature, resolution) {
    if (!feature.getGeometry()) return

    let styles = vm.styles
    let geoJsonFeature = write(feature, vm.view.getProjection())
    let layerId = feature.get(LAYER_PROP)

    if (typeof styles === 'function') {
      styles = styles(geoJsonFeature, resolution, layerId, styleHelper)
    } else if (Array.isArray(styles)) {
      styles = flow(
        filter(({ style, condition }) => {
          return condition == null ||
                 (condition === true) ||
                 (
                   typeof condition === 'function' &&
                   condition(geoJsonFeature, resolution, layerId)
                 )
        }),
        map('style')
      )(styles)
    }
    // null style
    if (styles === null || styles.length) return styles

    if (vm.defaultStyles) {
      return typeof vm.defaultStyles === 'function'
        ? vm.defaultStyles(geoJsonFeature, resolution, layerId, styleHelper)
        : vm.defaultStyles
    }
  }
}
