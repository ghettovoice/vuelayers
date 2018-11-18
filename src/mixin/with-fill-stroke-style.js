import Vue from 'vue'

const methods = {
  /**
   * @param {Fill|Vue|undefined} fill
   * @return {void}
   * @protected
   */
  setFill (fill) {
    fill = fill instanceof Vue ? fill.$style : fill

    if (fill !== this._fill) {
      this._fill = fill
    }
    if (this.$style && fill !== this.$style.getFill()) {
      this.$style.setFill(fill)
      this.scheduleRefresh()
    }
  },
  /**
   * @param {Stroke|Vue|undefined} stroke
   * @return {void}
   * @protected
   */
  setStroke (stroke) {
    stroke = stroke instanceof Vue ? stroke.$style : stroke

    if (stroke !== this._stroke) {
      this._stroke = stroke
    }
    if (this.$style && stroke !== this.$style.getStroke()) {
      this.$style.setStroke(stroke)
      this.scheduleRefresh()
    }
  },
}

export default {
  methods,
  stubVNode: {
    empty: false,
    attrs () {
      return {
        class: this.$options.name,
      }
    },
  },
  created () {
    /**
     * @type {Fill|undefined}
     * @private
     */
    this._fill = undefined
    /**
     * @type {Stroke|undefined}
     * @private
     */
    this._stroke = undefined
  },
}
