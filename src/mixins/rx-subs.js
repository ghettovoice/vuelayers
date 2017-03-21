/**
 * RxJS subscriptions manager.
 */
import { isPlainObject, isFunction, first, noop } from 'vl-utils/func'
import { errordbg } from 'vl-utils/debug'

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

      if (isPlainObject(first(args))) {
        observer = args.shift()
      } else if (isFunction(first(args))) {
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
