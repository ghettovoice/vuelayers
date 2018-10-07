import { fromEventPattern, merge as mergeObs } from 'rxjs/observable'

/**
 * Creates an Observable using OpenLayers event pattern that emits events coming from the given event target.
 *
 * @example **Subscribe on view center change events**
 * const map = ol.Map({ ... })
 * const changes = Observable.fromOlEvent(map.getView(), 'change:center')
 *
 * changes.subscribe(({ coordinate }) => console.log(coordinate))
 *
 * @param {ol.Object} target OpenLayers event target.
 * @param {string|Object[]} eventName The event name of interest, being emitted by the `target`
 *                          or an array of events/selectors like `[{ event: 'event1', selector?: x => x }, ...]`.
 * @param {function(...*): *} [selector] An optional function to post-process results. It takes the arguments
 *    from the event handler and should return a single value.
 * @return {Observable<T>}
 * @memberOf {Observable}
 */
export default function fromOlEvent (target, eventName, selector) {
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

          return fromOlEvent(target, eventName, selector)
        },
      ),
    )
  }

  return fromEventPattern(
    handler => target.on(eventName, handler),
    handler => target.un(eventName, handler),
    selector,
  )
}
