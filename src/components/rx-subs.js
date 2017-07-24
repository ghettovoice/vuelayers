/**
 * RxJS subscriptions manager.
 * @module mixins/rx-subs
 */
import { errordbg } from '../utils/debug'

const noop = () => {}

export default {
  methods: {
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () { },
    /**
     * @return {void}
     * @protected
     */
    unsubscribeAll () {
      this._rxSubs.forEach(x => x.unsubscribe())
      this._rxSubs = []
    },
    /**
     * @param {Observable<T>} observable
     * @param {function} [next] Next handler or Observer object.
     * @param {function} [error] Error handler.
     * @param {function} [complete] Complete handler.
     * @return {Subscription}
     * @protected
     */
    subscribeTo (observable, next = noop, error = noop, complete = noop) {
      error = err => {
        errordbg(err.stack)
        error(err)
      }

      const subs = observable.subscribe(next, error, complete)
      this._rxSubs.push(subs)

      return subs
    }
  },
  beforeCreate () {
    /**
     * @type {Subscription[]}
     * @private
     */
    this._rxSubs = []
  },
  destroyed () {
    this.unsubscribeAll()
  }
}
