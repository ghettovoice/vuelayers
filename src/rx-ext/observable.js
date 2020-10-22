import { fromEventPattern, merge as mergeObs, Observable } from 'rxjs'
import { distinctUntilChanged, map as mapObs } from 'rxjs/operators'
import { identity, isEqual, isFunction } from '../utils'

/**
 * Creates an Observable using OpenLayers event pattern that emits events coming from the given event target.
 *
 * @example **Subscribe on view center change events**
 * const map = ol.Map({ ... })
 * const changes = Observable.fromOlEvent(map.getView(), 'change:center')
 *
 * changes.subscribe(({ coordinate }) => console.log(coordinate))
 *
 * @param {module:ol/Observable~Observable} target OpenLayers event target.
 * @param {string|Object[]} eventName The event name of interest, being emitted by the `target`
 *                          or an array of events/selectors like `[{ event: 'event1', selector?: x => x }, ...]`.
 * @param {function(...*): *} [selector] An optional function to post-process results. It takes the arguments
 *    from the event handler and should return a single value.
 * @param {Observable[]} [pipeEach]
 * @return {Observable<T>}
 * @memberOf {Observable}
 */
export function fromOlEvent (target, eventName, selector, pipeEach = []) {
  if (Array.isArray(eventName)) {
    return mergeObs(
      ...eventName.map(
        elem => {
          let eventName, selector

          if (typeof elem === 'object') {
            eventName = elem.event
            selector = elem.selector
          } else {
            eventName = elem
          }

          return fromOlEvent(target, eventName, selector).pipe(...pipeEach)
        },
      ),
    )
  }

  selector || (selector = identity)

  return fromEventPattern(
    handler => target.on(eventName, handler),
    handler => target.un(eventName, handler),
  ).pipe(mapObs(selector))
}

/**
 * Creates Observable from OpenLayers change:* event
 * @param {module:ol/Observable~Observable} target
 * @param {string|string[]} [prop]
 * @param {boolean|function(a, b):boolean|undefined} [distinct] Distinct values by isEqual fn or by custom comparator
 * @param {function|undefined} [selector] Custom selector
 * @param {Observable[]} [pipeEach]
 * @return {Observable<{prop: string, value: *}>}
 */
export function fromOlChangeEvent (
  target,
  prop,
  distinct,
  selector,
  pipeEach = [],
) {
  if (Array.isArray(prop)) {
    return mergeObs(...prop.map(p => fromOlChangeEvent(target, p, distinct, selector).pipe(...pipeEach)))
  }

  selector || (selector = identity)
  const event = `change:${prop}`
  const observable = fromOlEvent(target, event, () => target.get(prop))
  const operations = []

  if (distinct) {
    isFunction(distinct) || (distinct = isEqual)
    operations.push(distinctUntilChanged(distinct))
  }

  operations.push(mapObs(value => selector({ prop, value })))

  return observable.pipe(...operations)
}

export function fromVueEvent (target, eventName, selector) {
  if (Array.isArray(eventName)) {
    return mergeObs(
      ...eventName.map(
        elem => {
          let eventName, selector

          if (typeof elem === 'object') {
            eventName = elem.event
            selector = elem.selector
          } else {
            eventName = elem
          }

          return fromVueEvent(target, eventName, selector)
        },
      ),
    )
  }

  selector || (selector = identity)

  return fromEventPattern(
    handler => target.$on(eventName, handler),
    handler => target.$off(eventName, handler),
  ).pipe(mapObs(selector))
}

export function fromVueWatcher (target, exprOrFn, options = {}) {
  return new Observable(s => {
    return target.$watch(exprOrFn, (value, previous) => s.next({ value, previous }), options)
  })
}
