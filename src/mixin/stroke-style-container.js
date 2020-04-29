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
  methods: {
    getStrokeStyleTarget () {
      throw new Error('Not implemented method: getStrokeStyleTarget')
    },
    /**
     * @returns {Promise<module:ol/style/Stroke~Stroke|undefined>}
     */
    async getStroke () {
      return (await this.getStrokeStyleTarget()).getStroke()
    },
    /**
     * @param {module:ol/style/Stroke~Stroke|undefined} stroke
     * @returns {Promise<void>}
     */
    async setStroke (stroke) {
      if (stroke && isFunction(stroke.resolveOlObject)) {
        stroke = await stroke.resolveOlObject()
      }

      const strokeTarget = await this.getStrokeStyleTarget()
      if (strokeTarget && stroke !== strokeTarget.getStroke()) {
        strokeTarget.setStroke(stroke)
        await this.scheduleRefresh()
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
