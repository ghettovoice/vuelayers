/**
 * RxJS extensions.
 */
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/throttleTime'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/merge'
import './from-ol-event'

export default Observable
