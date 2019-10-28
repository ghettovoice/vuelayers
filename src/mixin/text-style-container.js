import { isFunction } from '../util/minilo'

/**
 * @typedef {module:ol/style/Text~Text|Object|undefined} TextStyleLike
 */

/**
 * @typedef {Object} TextStyleTarget
 * @property {function(): module:ol/style/Text~Text|undefined} getText
 * @property {function(module:ol/style/Text~Text|undefined): void} setText
 */

/**
 * Text style container.
 */
export default {
  methods: {
    getTextStyleTarget () {
      throw new Error('Not implemented method: getTextStyleTarget')
    },
    /**
     * @returns {Promise<module:ol/style/Text~Text|undefined>}
     */
    async getText () {
      return (await this.getTextStyleTarget()).getText()
    },
    /**
     * @param {module:ol/style/Text~Text|undefined} text
     * @returns {Promise<void>}
     */
    async setText (text) {
      if (isFunction(text.resolveOlObject)) {
        text = await text.resolveOlObject()
      }

      const textTarget = await this.getTextStyleTarget()
      if (textTarget && text !== textTarget.getText()) {
        textTarget.setText(text)
        await this.scheduleRefresh()
      }
    },
    /**
     * @returns {{readonly textStyleContainer: Object}}
     */
    getServices () {
      const vm = this

      return {
        get textStyleContainer () { return vm },
      }
    },
  },
}
