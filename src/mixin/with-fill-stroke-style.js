import Vue from 'vue'

export default {
  methods: {
    /**
     * @param {Fill|Vue|undefined} fill
     * @return {void}
     * @protected
     */
    setFill (fill) {
      fill = fill instanceof Vue ? fill.$style : fill

      if (fill !== this._fill) {
        /**
         * @type {Fill|undefined}
         * @private
         */
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
        /**
         * @type {Stroke|undefined}
         * @private
         */
        this._stroke = stroke
      }
      if (this.$style && stroke !== this.$style.getStroke()) {
        this.$style.setStroke(stroke)
        this.scheduleRefresh()
      }
    },
  },
  stubVNode: {
    empty: false,
    attrs () {
      return {
        id: this.vmId,
        class: this.cmpName,
      }
    },
  },
}
