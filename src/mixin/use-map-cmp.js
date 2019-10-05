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
      // waits while $map service will be injected
      return intervalObs(1000 / 60).pipe(
        skipWhile(() => !(this.$map || this.$mapVm)),
        firstObs(),
        mapObs(() => this),
      ).toPromise(Promise)
    },
  },
}
