import { Text } from 'ol/style'
import { assert, coalesce } from '../utils'

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
     * @returns {{readonly textStyleContainer: Object}}
     */
    getServices () {
      const vm = this

      return {
        get textStyleContainer () { return vm },
      }
    },
    /**
     * @return {TextStyleTarget|undefined}
     */
    getTextStyleTarget () {
      throw new Error(`${this.vmName} not implemented method: getTextStyleTarget()`)
    },
    /**
     * @returns {module:ol/style/Text~Text|null}
     */
    getText () {
      return coalesce(this.getTextStyleTarget()?.getText(), this._text)
    },
    /**
     * @return {Object}
     */
    getTextVm () {
      return this._textVm
    },
    /**
     * @param {module:ol/style/Text~Text|undefined} text
     */
    setText (text) {
      text = text?.$style || text
      text || (text = undefined)
      assert(!text || text instanceof Text, 'Invalid text style')

      const textTarget = this.getTextStyleTarget()
      if (textTarget && text !== textTarget.getText()) {
        textTarget.setText(text)
        this.scheduleRefresh()
      }
      if (text !== this._text) {
        this._text = text
        this._textVm = text?.vm && text.vm[0]
        this.scheduleRefresh()
      }
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $text: {
      enumerable: true,
      get: this.getText,
    },
    $textVm: {
      enumerable: true,
      get: this.getTextVm,
    },
  })
}
