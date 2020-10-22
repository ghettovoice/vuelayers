import { retry } from 'rxjs/operators'
import { newLogger, noop } from '../utils'

/**
 * RxJS subscriptions manager.
 */
export default {
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
      this._rxSubs.forEach(subs => subs.unsubscribe())
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
      const errorWrap = err => {
        if (process.env.NODE_ENV !== 'production') {
          if (this.$logger) {
            this.$logger.error(err.stack)
          } else {
            newLogger(this.vmName).error(err.stack)
          }
        }
        error(err)
      }

      const subs = observable.pipe(
        retry(3),
      ).subscribe(next, errorWrap, complete)
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
}
