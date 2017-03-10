/**
 * RxJS extensions.
 */
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/throttleTime'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/map'
import './from-ol-event'

export default Observable
