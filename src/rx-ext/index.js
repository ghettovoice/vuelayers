/**
 * RxJS extensions.
 * @module rx-ext
 */
import { Observable } from 'rxjs'
import fromOlEvent from './from-ol-event'

Observable.fromOlEvent = fromOlEvent

export {
  Observable,
  fromOlEvent
}
