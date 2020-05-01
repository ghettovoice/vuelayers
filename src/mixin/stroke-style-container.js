import { isFunction } from '../util/minilo'

/**
 * @typedef {module:ol/style/Stroke~Stroke|Object|undefined} StrokeStyleLike
 */

/**
 * @typedef {Object} StrokeStyleTarget
 * @property {function(): module:ol/style/Stroke~Stroke|undefined} getStroke
 * @property {function(module:ol/style/Stroke~Stroke|undefined): void} setStroke
 */

/**
 * Stroke style container.
 */
export default {
  created () {
    this._stroke = undefined
    this._strokeVm = undefined

    this::defineServices()
  },
  methods: {
    getStrokeStyleTarget () {
      throw new Error('Not implemented method: getStrokeStyleTarget')
    },
    /**
     * @returns {module:ol/style/Stroke~Stroke|undefined}
     */
    getStroke () {
      return this._stroke
    },
    /**
     * @param {module:ol/style/Stroke~Stroke|undefined} stroke
     * @returns {Promise<void>}
     */
    async setStroke (stroke) {
      let strokeVm
      if (stroke && isFunction(stroke.resolveOlObject)) {
        strokeVm = stroke
        stroke = await stroke.resolveOlObject()
      }

      const strokeTarget = await this.getStrokeStyleTarget()
      if (strokeTarget && stroke !== strokeTarget.getStroke()) {
        strokeTarget.setStroke(stroke)
        this._stroke = stroke
        this._strokeVm = strokeVm || (stroke?.vm && stroke.vm[0])
      }
    },
    /**
     * @returns {{readonly strokeStyleContainer: Object}}
     */
    getServices () {
      const vm = this

      return {
        get strokeStyleContainer () { return vm },
      }
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $stroke: {
      enumerable: true,
      get: this.getStroke,
    },
    $strokeVm: {
      enumerable: true,
      get: () => this._strokeVm,
    },
  })
}
