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
  methods: {
    getFillStyleTarget () {
      throw new Error('Not implemented method: getFillStyleTarget')
    },
    /**
     * @returns {Promise<module:ol/style/Fill~Fill|undefined>}
     */
    async getFill () {
      return (await this.getFillStyleTarget()).getFill()
    },
    /**
     * @param {module:ol/style/Fill~Fill|undefined} fill
     * @returns {Promise<void>}
     */
    async setFill (fill) {
      if (fill && isFunction(fill.resolveOlObject)) {
        fill = await fill.resolveOlObject()
      }

      const fillTarget = await this.getFillStyleTarget()
      if (fillTarget && fill !== fillTarget.getFill()) {
        fillTarget.setFill(fill)
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
