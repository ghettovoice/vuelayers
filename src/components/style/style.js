/**
 * Basic style mixin.
 * Exposes for children inner OpenLayer style object as styleTarget.
 * Injects styleTarget from parent to apply self style.
 */
import { debounce } from 'lodash/fp'

const methods = {
  /**
   * @protected
   */
  initialize () {
    /**
     * @type {ol.style.Style|ol.style.Image|ol.style.Fill|ol.style.Stroke|ol.style.Text}
     * @protected
     */
    this.style = this.createStyle()
    this.style.$vm = this
  },
  /**
   * @return {ol.style.Style|ol.style.Image|ol.style.Fill|ol.style.Stroke|ol.style.Text}
   * @protected
   */
  createStyle () {
    throw new Error('Not implemented method')
  },
  /**
   * ol.style.Image do not have some setters than inner styles can't be applied
   * at runtime after instance of ol.style.Image created.
   * This method used to emulate needed setters for inner style components.
   *
   * @protected
   */
  getStyleTarget () { },
  /**
   * @protected
   */
  mountStyle () {
    throw new Error('Not implemented method')
  },
  /**
   * @protected
   */
  unmountStyle () {
    throw new Error('Not implemented method')
  },
  refresh: debounce(100, function () {
    this.mountStyle()
  })
}

export default {
  methods,
  render: h => h(),
  mounted () {
    // Create style in  mounted hook because of some ol style classes doesn't have
    // setters for all inner objects. This setters are emulated through method: getStyleTarget
    this.initialize()
    this.mountStyle()
  },
  destroyed () {
    this.unmountStyle()
    this.style = undefined
  }
}

