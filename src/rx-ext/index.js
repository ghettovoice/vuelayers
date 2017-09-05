/**
 * RxJS extensions.
 * @module rx-ext
 */
import { Observable } from 'rxjs/Observable'
import fromOlEvent from './from-ol-event'
import fromOlChangeEvent from './from-ol-change-event'

Observable.fromOlEvent = fromOlEvent
Observable.fromOlChangeEvent = fromOlChangeEvent

export {
  fromOlEvent,
  fromOlChangeEvent,
}
