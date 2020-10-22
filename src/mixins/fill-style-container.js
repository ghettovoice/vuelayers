import { Fill } from 'ol/style'
import { assert, coalesce } from '../utils'

/**
 * @typedef {module:ol/style/Fill~Fill|Object|undefined} FillStyleLike
 */

/**
 * @typedef {Object} FillStyleTarget
 * @property {function(): module:ol/style/Fill~Fill|undefined} getFill
 * @property {function(module:ol/style/Fill~Fill|undefined): void} setFill
 */

/**
 * Fill style container.
 */
export default {
  created () {
    this._fill = undefined
    this._fillVm = undefined

    this::defineServices()
  },
  methods: {
    /**
     * @returns {{readonly fillStyleContainer: Object}}
     */
    getServices () {
      const vm = this

      return {
        get fillStyleContainer () { return vm },
      }
    },
    /**
     * @return {FillStyleTarget}
     */
    getFillStyleTarget () {
      throw new Error(`${this.vmName} not implemented method: getFillStyleTarget()`)
    },
    /**
     * @returns {module:ol/style/Fill~Fill|undefined}
     */
    getFill () {
      return coalesce(this.getFillStyleTarget()?.getFill(), this._fill)
    },
    /**
     * @return {Object}
     */
    getFillVm () {
      return this._fillVm
    },
    /**
     * @param {module:ol/style/Fill~Fill|undefined} fill
     */
    setFill (fill) {
      fill = fill?.$style || fill
      fill || (fill = undefined)
      assert(!fill || fill instanceof Fill, 'Invalid fill style')

      if (fill !== this._fill) {
        this._fill = fill
        this._fillVm = fill?.vm && fill.vm[0]
        this.scheduleRefresh()
      }

      const fillTarget = this.getFillStyleTarget()
      if (fillTarget && fill !== fillTarget.getFill()) {
        fillTarget.setFill(fill)
        this.scheduleRefresh()
      }
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $fill: {
      enumerable: true,
      get: this.getFill,
    },
    $fillVm: {
      enumerable: true,
      get: this.getFillVm,
    },
  })
}
