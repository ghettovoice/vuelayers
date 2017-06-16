/**
 * RxJS extensions.
 * @module rx-ext
 */
import { Observable } from 'rxjs/Observable'
import fromOlEvent from './from-ol-event'

Observable.fromOlEvent = fromOlEvent

export {
  fromOlEvent
}
