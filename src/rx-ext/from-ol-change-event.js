import { merge as mergeObs } from 'rxjs/observable'
import { distinctUntilChanged, map as mapObs, debounceTime } from 'rxjs/operators'
import { isEqual, isFunction } from '../util/minilo'
import fromOlEvent from './from-ol-event'

/**
 * Creates Observable from OpenLayers change:* event
 * @param {module:ol/Observable~Observable} target
 * @param {string|string[]} [prop]
 * @param {boolean|function(a, b):boolean|undefined} [distinct] Distinct values by isEqual fn or by custom comparator
 * @param {number|undefined} [debounce] Debounce values by passed amount of ms.
 * @param {function|undefined} [selector] Custom selector
 * @return {Observable<{prop: string, value: *}>}
 */
export default function fromOlChangeEvent (target, prop, distinct, debounce, selector) {
  if (Array.isArray(prop)) {
    return mergeObs(...prop.map(p => fromOlChangeEvent(target, p)))
  }

  selector = selector || ((target, prop) => target.get(prop))
  let event = `change:${prop}`
  let observable = fromOlEvent(target, event, () => selector(target, prop))
  let operations = []

  if (debounce != null) {
    operations.push(debounceTime(debounce))
  }
  if (distinct) {
    isFunction(distinct) || (distinct = isEqual)
    operations.push(distinctUntilChanged(distinct))
  }

  operations.push(mapObs(value => ({ prop, value })))

  return observable.pipe(...operations)
}
