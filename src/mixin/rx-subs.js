import { error as logError } from '../util/log'
import { noop } from '../util/minilo'

/**
 * RxJS subscriptions manager.
 */
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
        if (process.env.NODE_ENV !== 'production') {
          logError(err.stack)
        }
        error(err)
      }

      const subs = observable.subscribe(next, error, complete)
      this._rxSubs.push(subs)

      return subs
    },
    unsubscribe (subs) {
      const idx = this._rxSubs.indexOf(subs)
      if (idx === -1) return

      subs.unsubscribe()
      this._rxSubs.splice(idx, 1)
    },
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
  },
}
