import Vue from 'vue'
import { assertHasStyle } from '../../utils/assert'

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
      assertHasStyle(this)

      fill = fill instanceof Vue ? fill.style : fill
      this.style.setFill(fill)
      this.deferRefresh()
    },
    /**
     * @param {ol.style.Stroke|Vue|undefined} stroke
     * @return {void}
     * @protected
     */
    setStroke (stroke) {
      assertHasStyle(this)

      stroke = stroke instanceof Vue ? stroke.style : stroke
      this.style.setStroke(stroke)
      this.deferRefresh()
    }
  }
}
