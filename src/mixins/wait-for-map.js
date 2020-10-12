import { race as raceObs } from 'rxjs'
import { filter as filterObs, mapTo } from 'rxjs/operators'
import { fromVueEvent as obsFromVueEvent, fromVueWatcher as obsFromVueWatcher } from '../rx-ext'
import { hasProp, stubTrue, waitFor } from '../utils'
import { olCmp } from './index'
import { CanceledError, isCreateError, OlObjectEvent } from './ol-cmp'

export default {
  methods: {
    async beforeInit () {
      try {
        await waitFor(
          () => this.$mapVm != null,
          raceObs(
            this.$olObjectEvents.pipe(
              filterObs(({ name, args }) => {
                return name === OlObjectEvent.ERROR &&
                  args[0] instanceof CanceledError
              }),
            ),
            obsFromVueEvent(this.$eventBus, OlObjectEvent.ERROR).pipe(
              filterObs(([err, vm]) => {
                return isCreateError(err) &&
                  hasProp(vm, '$map') &&
                  this.$vq.closest(vm)
              }),
            ),
          ).pipe(
            mapTo(stubTrue()),
          ),
        )
        this.viewProjection = this.$mapVm.resolvedViewProjection
        this.dataProjection = this.$mapVm.resolvedDataProjection
        this.subscribeTo(
          obsFromVueWatcher(this, () => this.$mapVm.resolvedViewProjection),
          ({ value }) => { this.viewProjection = value },
        )
        this.subscribeTo(
          obsFromVueWatcher(this, () => this.$mapVm.resolvedDataProjection),
          ({ value }) => { this.dataProjection = value },
        )
        await this.$nextTickPromise()

        return this::olCmp.methods.beforeInit()
      } catch (err) {
        err.message = `${this.vmName} wait for $mapVm injection: ${err.message}`
        throw err
      }
    },
  },
}
