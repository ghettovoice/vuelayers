/**
 * Basic style mixin.
 * Exposes for children inner OpenLayer style object as styleTarget.
 * Injects styleTarget from parent to apply self style.
 */
import { debounce } from 'lodash/fp'
import exposeInject from 'vuelayers/src/mixins/expose-inject'

const methods = {
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
  getStyleTarget () {
    return this.style
  },
  /**
   * @return {{styleTarget: *}}
   * @protected
   */
  expose () {
    return {
      ...this.$parent.expose(),
      styleTarget: this.getStyleTarget()
    }
  },
  /**
   * @protected
   */
  append () {
    throw new Error('Not implemented method')
  },
  /**
   * @protected
   */
  remove () {
    throw new Error('Not implemented method')
  },
  refresh: debounce(100, function () {
    this.append()
  })
}

export default {
  mixins: [ exposeInject ],
  inject: [ 'styleTarget' ],
  methods,
  render: h => h(),
  mounted () {
    // Create style in  mounted hook because of some ol style classes doesn't have
    // setters for all inner objects. This setters are emulated through method: getStyleTarget
    /**
     * @type {ol.style.Style|ol.style.Image|ol.style.Fill|ol.style.Stroke|ol.style.Text}
     * @protected
     */
    this.style = this.createStyle()
    this.style.vm = this

    this.append()
  },
  beforeDestroy () {
    this.remove()
  },
  destroyed () {
    this.style = undefined
  }
}

