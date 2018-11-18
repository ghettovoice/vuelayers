import style from './style'
import { first as firstObs } from 'rxjs/operators'
import { observableFromOlEvent } from '../rx-ext'

const props = {
}

const methods = {
  /**
   * @return {Promise}
   * @protected
   */
  init () {
    return this::style.methods.init()
  },
  /**
   * @return {void|Promise<void>}
   * @protected
   */
  deinit () {
    return this::style.methods.deinit()
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    this.$stylesContainer && this.$stylesContainer.setImage(this)
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.$stylesContainer && this.$stylesContainer.setImage(undefined)
  },
  /**
   * @return {Object}
   * @protected
   */
  getServices () {
    return this::style.methods.getServices()
  },
  /**
   * @return {Promise}
   */
  refresh () {
    if (this.$olObject == null) return Promise.resolve()
    // recreate style
    return this.recreate()
      .then(() => {
        if (!this.$map) {
          return
        }

        this.$map.render()

        return observableFromOlEvent(this.$map, 'postcompose')
          .pipe(firstObs())
          .toPromise()
      })
  },
}

const watch = {
}

export default {
  mixins: [style],
  props,
  methods,
  watch,
  stubVNode: {
    empty: false,
    attrs () {
      return {
        class: this.$options.name,
      }
    },
  },
}
