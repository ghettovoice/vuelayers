/**
 * RxJS extensions.
 * @module rx-ext
 */
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/fromEventPattern'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/throttleTime'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/merge'
import 'rxjs/add/operator/do'
import fromOlEvent from './from-ol-event'

Observable.fromOlEvent = fromOlEvent

export default Observable
