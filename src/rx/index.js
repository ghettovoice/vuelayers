/**
 * RxJS extensions.
 */
import { Observable } from 'rxjs/Observable'
export fromOlEvent from './from-ol-event'

Object.assign(Observable, {
  fromOlEvent
})
