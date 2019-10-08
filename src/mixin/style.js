import { first as firstObs } from 'rxjs/operators'
import { getStyleId, initializeStyle, setStyleId } from '../ol-ext'
import { obsFromOlEvent } from '../rx-ext'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { waitFor } from '../util/minilo'
import olCmp from './ol-cmp'
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
  watch: {
    id (value) {
      if (!this.$style || value === getStyleId(this.$style)) {
        return
      }

      setStyleId(this.$style, value)
    },
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @return {OlStyle|Promise<OlStyle>}
     * @protected
     */
    async createOlObject () {
      const style = await this.createStyle()

      initializeStyle(style)

      return style
    },
    /**
     * @return {OlStyle|Promise<OlStyle>}
     * @protected
     * @abstract
     */
    createStyle () {
      throw new Error('Not implemented method')
    },
    // todo refactor methods, add missed
    /**
     * @returns {Promise<void>}
     * @protected
     */
    async init () {
      await waitFor(() => this.$mapVm != null)

      return this::olCmp.methods.init()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    deinit () {
      return this::olCmp.methods.deinit()
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(this::olCmp.methods.getServices(), {
        get style () { return vm.$style },
      })
    },
    /**
     * @return {Promise}
     */
    refresh () {
      if (this.$olObject == null) return Promise.resolve()

      return this.remount()
        .then(() => {
          if (!this.$map) {
            return
          }

          this.$map.render()

          return obsFromOlEvent(this.$map, 'postcompose')
            .pipe(firstObs())
            .toPromise()
        })
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $style: {
      enumerable: true,
      get: () => this.$olObject,
    },
    $mapVm: {
      enumerable: true,
      get: () => this.$services?.mapVm,
    },
    $view: {
      enumerable: true,
      get: () => this.$mapVm?.$view,
    },
    $stylesContainer: {
      enumerable: true,
      get: () => this.$services?.stylesContainer,
    },
  })
}
