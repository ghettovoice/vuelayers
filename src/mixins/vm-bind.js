/**
 * Provide method to add to some object `$vm` getter.
 */
import { remove } from 'lodash/fp'
// todo remove this shit later
export default {
  methods: {
    /**
     * @param {*} object
     * @return {*}
     * @protected
     */
    bindSelfTo (object) {
      this._vmBinded.push(object)

      return Object.defineProperty(object, '$vm', {
        configurable: true,
        get: () => this
      })
    },
    /**
     * @protected
     */
    unbindSelfFrom (object) {
      delete object.$vm
      remove(x => x === object, this._vmBinded)
    },
    /**
     * @protected
     */
    unbindFromAll () {
      this._vmBinded.forEach(this.unbindSelfFrom)
    }
  },
  beforeCreate () {
    /**
     * @type {Array}
     * @private
     */
    this._vmBinded = []
  },
  destroyed () {
    this.unbindFromAll()
  }
}
