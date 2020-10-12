import debounce from 'debounce-promise'
import { dumpTextStyle } from '../ol-ext'
import { clonePlainObject, isEqual, isFunction } from '../utils'
import { FRAME_TIME } from './ol-cmp'

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
  computed: {
    currentText () {
      if (!(this.rev && this.$text)) return

      return dumpTextStyle(this.$text)
    },
  },
  watch: {
    currentText: {
      deep: true,
      handler: /*#__PURE__*/debounce(function (value, prev) {
        if (isEqual(value, prev)) return

        this.$emit('update:text', value && clonePlainObject(value))
      }, FRAME_TIME),
    },
  },
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
     * @return {Promise<module:ol/style/Text~Text|undefined>}
     */
    getTextStyleTarget () {
      throw new Error(`${this.vmName} not implemented method: getTextStyleTarget()`)
    },
    /**
     * @returns {module:ol/style/Text~Text|null}
     */
    getText () {
      return this._text
    },
    /**
     * @return {Object}
     */
    getTextVm () {
      return this._textVm
    },
    /**
     * @param {module:ol/style/Text~Text|undefined} text
     * @returns {Promise<void>}
     */
    async setText (text) {
      if (isFunction(text?.resolveOlObject)) {
        text = await text.resolveOlObject()
      }
      text || (text = null)

      if (text === this._text) return

      const textTarget = await this.getTextStyleTarget()
      if (!textTarget) return

      this._text = text
      this._textVm = text?.vm && text.vm[0]
      await textTarget.setText(text)
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
