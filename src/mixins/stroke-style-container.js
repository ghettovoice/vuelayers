import { Stroke } from 'ol/style'
import { assert, coalesce } from '../utils'

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
    /**
     * @returns {{readonly strokeStyleContainer: Object}}
     */
    getServices () {
      const vm = this

      return {
        get strokeStyleContainer () { return vm },
      }
    },
    /**
     * @return {StrokeStyleTarget}
     */
    getStrokeStyleTarget () {
      throw new Error(`${this.vmName} not implemented method: getStrokeStyleTarget()`)
    },
    /**
     * @returns {module:ol/style/Stroke~Stroke|undefined}
     */
    getStroke () {
      return coalesce(this.getStrokeStyleTarget()?.getStroke(), this._stroke)
    },
    /**
     * @return {Object}
     */
    getStrokeVm () {
      return this._strokeVm
    },
    /**
     * @param {module:ol/style/Stroke~Stroke|undefined} stroke
     */
    setStroke (stroke) {
      stroke = stroke?.$style || stroke
      stroke || (stroke = undefined)
      assert(!stroke || stroke instanceof Stroke, 'Invalid stroke')

      const strokeTarget = this.getStrokeStyleTarget()
      if (strokeTarget && stroke !== strokeTarget.getStroke()) {
        strokeTarget.setStroke(stroke)
        this.scheduleRefresh()
      }
      if (stroke !== this._stroke) {
        this._stroke = stroke
        this._strokeVm = stroke?.vm && stroke.vm[0]
        this.scheduleRefresh()
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
      get: this.getStrokeVm,
    },
  })
}
