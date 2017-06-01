/**
 * @module components/style-target
 */
import { filter, flow, map, partialRight } from 'lodash/fp'
import { geoJson, styleHelper, coordHelper, geomHelper } from '../ol-ext'
import { SERVICE_CONTAINER_KEY } from '../consts'
import { assertHasView } from '../utils/assert'

export default {
  beforeCreate () {
    /**
     * @type {ol.style.Style[]|ol.StyleFunction|undefined}
     * @private
     */
    this.styles = this.defaultStyles = undefined
  },
  provide () {
    const vm = this
    // export to inner components style target object (object with getStyle/setStyle methods)
    return {
      [SERVICE_CONTAINER_KEY]: {
        get styleTarget () {
          return {
            getStyle: vm.getStyle,
            setStyle: vm.setStyle
          }
        }
      }
    }
  },
  methods: {
    /**
     * Returns object that can be styled, i.e. have setStyle/getStyle methods
     * @return {*}
     * @abstract
     */
    getStyleTarget () { },
    /**
     * @returns {ol.style.Style[]|ol.StyleFunction|undefined}
     */
    getStyle () {
      return this.styles
    },
    /**
     * @returns {ol.style.Style[]|ol.StyleFunction|undefined}
     */
    getDefaultStyle () {
      return this.defaultStyles
    },
    /**
     * @param {ol.style.Style[]|ol.StyleFunction|undefined} styles
     * @return {void}
     */
    setStyle (styles) {
      this.styles = styles
      const styleTarget = this.getStyleTarget()

      if (styleTarget) {
        if (this.styles === null || this.styles) {
          styleTarget.setStyle(createStyleFunc(this))
        } else {
          styleTarget.setStyle(undefined)
        }
      }
    }
  }
}

/**
 * @param {Object} vm
 * @returns {ol.StyleFunction}
 */
export function createStyleFunc (vm) {
  return function __styleTargetStyleFunc (feature, resolution) {
    assertHasView(vm)

    if (!feature.getGeometry()) return

    let styles = vm.getStyle()
    let geoJsonFeature = geoJson.writeFeature(feature, vm.view.getProjection())

    if (typeof styles === 'function') {
      styles = styles(
        feature,
        resolution,
        {
          ...styleHelper,
          ...geomHelper,
          ...coordHelper,
          geom: partialRight(styleHelper.geom, [vm.view.getProjection()]),
          geoJson
        }
      )
    } else if (Array.isArray(styles)) {
      styles = flow(
        filter(({ condition }) => {
          return condition == null ||
            (condition === true) ||
            (
              typeof condition === 'function' &&
              condition(geoJsonFeature, resolution)
            )
        }),
        map('style')
      )(styles)
    }
    // null style
    if (styles === null || (Array.isArray(styles) && styles.length)) return styles

    let defaultStyles = vm.getDefaultStyle()
    if (defaultStyles) {
      return typeof defaultStyles === 'function'
        ? vm::defaultStyles(feature, resolution, styleHelper)
        : defaultStyles
    }
  }
}
