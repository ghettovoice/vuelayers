import { isEqual, isFunction } from 'lodash/fp'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/merge'
import 'rxjs/add/operator/throttleTime'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/map'
import fromOlEvent from './from-ol-event'

/**
 * Creates Observable from OpenLayers change:* event
 * @param {ol.Object} target
 * @param {string|string[]|undefined} [prop]
 * @param {boolean|function(a, b):boolean|undefined} [distinct] Distinct values by lodash isEqual values or
 *                                                              by custom comparator
 * @param {number|undefined} [throttle] Throttle values by passed amount of ms.
 * @param {function(target: ol.Object, prop: string):*|undefined} [selector] Custom selector
 * @return {Observable<{prop: string, value: *}>}
 */
export default function fromOlChangeEvent (target, prop, distinct, throttle, selector) {
  if (Array.isArray(prop)) {
    return Observable.merge(...prop.map(p => fromOlChangeEvent(target, p)))
  }

  selector = selector || ((target, prop) => target.get(prop))
  let event = `change${prop ? ':' + prop : ''}`
  let observable = fromOlEvent(target, event, () => selector(target, prop))

  if (throttle != null) {
    observable = observable.throttleTime(throttle)
  }
  if (distinct) {
    observable = observable.distinctUntilChanged(isFunction(distinct) ? distinct : isEqual)
  }

  return observable.map(value => ({ prop, value }))
}
