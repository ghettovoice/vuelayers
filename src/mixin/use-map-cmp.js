import { Observable } from 'rxjs'
import { interval as intervalObs } from 'rxjs/observable'
import { first as firstObs, map as mapObs, skipWhile, toPromise } from 'rxjs/operator'

/**
 * Basic mixin for ol components that depends on map instance
 */
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
        ::toPromise(Promise)
    },
  },
}
