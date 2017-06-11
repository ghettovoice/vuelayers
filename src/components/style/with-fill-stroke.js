import Vue from 'vue'
import * as assert from '../../utils/assert'

export default {
  stubVNode: {
    empty: false,
    attrs () {
      return {
        id: this.$options.name
      }
    }
  },
  methods: {
    /**
     * @param {ol.style.Fill|Vue|undefined} fill
     * @return {void}
     * @protected
     */
    setFill (fill) {
      assert.hasStyle(this)

      fill = fill instanceof Vue ? fill.style : fill
      this.style.setFill(fill)
      this.requestRefresh()
    },
    /**
     * @param {ol.style.Stroke|Vue|undefined} stroke
     * @return {void}
     * @protected
     */
    setStroke (stroke) {
      assert.hasStyle(this)

      stroke = stroke instanceof Vue ? stroke.style : stroke
      this.style.setStroke(stroke)
      this.requestRefresh()
    }
  }
}
