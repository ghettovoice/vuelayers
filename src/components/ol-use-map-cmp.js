/**
 * Basic mixin for ol components that depends on map instance
 * @module components/ol-use-map-cmp
 */
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/interval'
import 'rxjs/add/operator/skipWhile'
import 'rxjs/add/operator/first'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/toPromise'

export default {
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    beforeInit () {
      return Observable.interval(100)
        .skipWhile(() => !this.$map)
        .first()
        .map(() => this)
        .toPromise()
    }
  }
}
