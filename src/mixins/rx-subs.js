/**
 * RxJS subscriptions manager.
 */
import { errordbg } from 'vl-utils/debug'

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
     * @param {function|Observer} [next] Next handler or Observer object.
     * @param {function} [error] Error handler.
     * @param {function} [complete] Complete handler.
     * @return {Subscription}
     *
     * @protected
     */
    subscribeTo (observable, ...args) {
      let observer = {}

      if (typeof args[ 0 ] === 'object') {
        observer = args.shift()
      } else if (typeof args[ 0 ] === 'function') {
        observer = {
          next: args.shift(),
          error: args.shift(),
          complete: args.shift()
        }
      }

      const errHandler = observer.error || noop
      observer.error = err => {
        errordbg(err.stack)
        errHandler(err)
      }

      const subs = observable.subscribe(...args)
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
