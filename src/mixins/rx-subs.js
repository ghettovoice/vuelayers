/**
 * RxJS subscriptions manager.
 */
import { errordbg } from '../utils/debug'

const noop = () => {}

export default {
  methods: {
    /**
     * @protected
     */
    subscribeAll () { },
    /**
     * @protected
     */
    unsubscribeAll () {
      this.rxSubs.forEach(x => x.unsubscribe())
      this.rxSubs = []
    },
    /**
     * @param {Observable} observable
     * @param {function} [next] Next handler or Observer object.
     * @param {function} [error] Error handler.
     * @param {function} [complete] Complete handler.
     * @return {Subscription}
     *
     * @protected
     */
    subscribeTo (observable, next = noop, error = noop, complete = noop) {
      error = err => {
        errordbg(err.stack)
        error(err)
      }

      const subs = observable.subscribe(next, error, complete)
      this.rxSubs.push(subs)

      return subs
    }
  },
  beforeCreate () {
    /**
     * @type {Subscription[]}
     * @protected
     */
    this.rxSubs = []
  },
  destroyed () {
    this.unsubscribeAll()
  }
}
