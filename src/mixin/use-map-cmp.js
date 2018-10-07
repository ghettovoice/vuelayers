import { interval as intervalObs } from 'rxjs/observable'
import { first as firstObs, map as mapObs, skipWhile } from 'rxjs/operators'

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
      return intervalObs(100).pipe(
        skipWhile(() => !this.$map),
        firstObs(),
        mapObs(() => this),
      ).toPromise(Promise)
    },
  },
}
