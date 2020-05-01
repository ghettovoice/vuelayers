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
  created () {
    this._text = undefined
    this._textVm = undefined

    this::defineServices()
  },
  methods: {
    /**
     * @return {Promise<module:ol/style/Text~Text|undefined>}
     */
    getTextStyleTarget () {
      throw new Error('Not implemented method: getTextStyleTarget')
    },
    /**
     * @returns {module:ol/style/Text~Text|undefined}
     */
    getText () {
      return this._text
    },
    /**
     * @param {module:ol/style/Text~Text|undefined} text
     * @returns {Promise<void>}
     */
    async setText (text) {
      let textVm
      if (text && isFunction(text.resolveOlObject)) {
        textVm = text
        text = await text.resolveOlObject()
      }

      const textTarget = await this.getTextStyleTarget()
      if (textTarget && text !== textTarget.getText()) {
        textTarget.setText(text)
        this._text = text
        this._textVm = textVm || (text?.vm && text.vm[0])
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

function defineServices () {
  Object.defineProperties(this, {
    $text: {
      enumerable: true,
      get: this.getStroke,
    },
    $textVm: {
      enumerable: true,
      get: () => this._textVm,
    },
  })
}
