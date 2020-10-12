import { filter as filterObs, mapTo } from 'rxjs/operators'
import { EPSG_3857, getStyleId, initializeStyle, setStyleId } from '../ol-ext'
import { fromVueEvent as obsFromVueEvent, fromVueWatcher as obsFromVueWatcher } from '../rx-ext'
import { assert, hasProp, mergeDescriptors, pick, stubTrue, waitFor } from '../utils'
import olCmp, { isCreateError, OlObjectEvent } from './ol-cmp'
import stubVNode from './stub-vnode'

/**
 * Basic style mixin.
 */
export default {
  mixins: [
    stubVNode,
    olCmp,
  ],
  stubVNode: {
    empty () {
      return this.vmId
    },
  },
  data () {
    return {
      viewProjection: EPSG_3857,
      dataProjection: EPSG_3857,
    }
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @returns {Promise<void>}
     * @protected
     */
    async beforeInit () {
      try {
        await waitFor(
          () => this.$mapVm != null,
          obsFromVueEvent(this.$eventBus, OlObjectEvent.ERROR).pipe(
            filterObs(([err, vm]) => {
              return isCreateError(err) &&
                hasProp(vm, '$map') &&
                this.$vq.closest(vm)
            }),
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
        err.message = 'Wait for $mapVm injection: ' + err.message
        throw err
      }
    },
    /**
     * @return {OlStyle|Promise<OlStyle>}
     * @protected
     */
    async createOlObject () {
      return initializeStyle(await this.createStyle(), this.currentId)
    },
    /**
     * @return {OlStyle|Promise<OlStyle>}
     * @protected
     * @abstract
     */
    createStyle () {
      throw new Error(`${this.vmName} not implemented method: createStyle()`)
    },
    /**
     * @return {Promise<void>}
     */
    async remount () {
      await this.refresh()
      await this::olCmp.methods.remount()

      if (this.$mapVm) {
        await this.$mapVm.render()
      }
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::olCmp.methods.getServices(),
        {
          get styleVm () { return vm },
        },
      )
    },
    /**
     * @return {Promise<OlStyle>}
     */
    resolveStyle: olCmp.methods.resolveOlObject,
    .../*#__PURE__*/pick(olCmp.methods, [
      'init',
      'deinit',
      'beforeMount',
      'mount',
      'unmount',
      'refresh',
      'scheduleRefresh',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'subscribeAll',
      'resolveOlObject',
    ]),
    /**
     * @returns {string|number}
     */
    getIdInternal () {
      return getStyleId(this.$style)
    },
    /**
     * @param {string|number} id
     * @returns {void}
     */
    setIdInternal (id) {
      assert(id != null && id !== '', 'Invalid style id')

      if (id === this.getIdInternal()) return

      setStyleId(this.$style, id)
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    /**
     * @type {OlStyle|undefined}
     */
    $style: {
      enumerable: true,
      get: () => this.$olObject,
    },
    /**
     * @type {Object|undefined}
     */
    $mapVm: {
      enumerable: true,
      get: () => this.$services?.mapVm,
    },
    /**
     * @type {Object|undefined}
     */
    $viewVm: {
      enumerable: true,
      get: () => this.$services?.viewVm,
    },
    /**
     * @type {Object|undefined}
     */
    $styleContainer: {
      enumerable: true,
      get: () => this.$services?.styleContainer,
    },
  })
}
