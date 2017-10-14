/**
 * Basic mixin for ol components that depends on map instance
 * @module components/ol-use-map-cmp
 */
import { Observable } from 'rxjs/Observable'
import { interval as intervalObs } from 'rxjs/observable/interval'
import { first as firstObs } from 'rxjs/operator/first'
import { map as mapObs } from 'rxjs/operator/map'
import { skipWhile } from 'rxjs/operator/skipWhile'
import { toPromise } from 'rxjs/operator/toPromise'

export default {
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    beforeInit () {
      return Observable::intervalObs(100)
        ::skipWhile(() => !this.$map)
        ::firstObs()
        ::mapObs(() => this)
        ::toPromise()
    },
  },
}
