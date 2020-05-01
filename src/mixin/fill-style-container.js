import { isFunction } from '../util/minilo'

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
    getFillStyleTarget () {
      throw new Error('Not implemented method: getFillStyleTarget')
    },
    /**
     * @returns {module:ol/style/Fill~Fill|undefined}
     */
    getFill () {
      return this._fill
    },
    /**
     * @param {module:ol/style/Fill~Fill|undefined} fill
     * @returns {Promise<void>}
     */
    async setFill (fill) {
      let fillVm
      if (fill && isFunction(fill.resolveOlObject)) {
        fillVm = fill
        fill = await fill.resolveOlObject()
      }

      const fillTarget = await this.getFillStyleTarget()
      if (fillTarget && fill !== fillTarget.getFill()) {
        fillTarget.setFill(fill)
        this._fill = fill
        this._fillVm = fillVm || (fill?.vm && fill.vm[0])
      }
    },
    /**
     * @returns {{readonly fillStyleContainer: Object}}
     */
    getServices () {
      const vm = this

      return {
        get fillStyleContainer () { return vm },
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
      get: () => this._fillVm,
    },
  })
}
