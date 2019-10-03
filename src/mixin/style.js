import { first as firstObs } from 'rxjs/operators'
import { getStyleId, initializeStyle, setStyleId } from '../ol-ext'
import { observableFromOlEvent } from '../rx-ext'
import mergeDescriptors from '../util/multi-merge-descriptors'
import cmp from './ol-virt-cmp'
import useMapCmp from './use-map-cmp'

/**
 * Basic style mixin.
 */
export default {
  mixins: [cmp, useMapCmp],
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
    /**
     * @return {Promise}
     * @protected
     */
    init () {
      return this::cmp.methods.init()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    deinit () {
      return this::cmp.methods.deinit()
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(this::cmp.methods.getServices(), {
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

          return observableFromOlEvent(this.$map, 'postcompose')
            .pipe(firstObs())
            .toPromise()
        })
    },
  },
  stubVNode: {
    empty () {
      return this.vmId
    },
  },
  created () {
    this::defineServices()
  },
  watch: {
    id (value) {
      if (!this.$style || value === getStyleId(this.$style)) {
        return
      }

      setStyleId(this.$style, value)
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $style: {
      enumerable: true,
      get: () => this.$olObject,
    },
    $map: {
      enumerable: true,
      get: () => this.$services && this.$services.map,
    },
    $view: {
      enumerable: true,
      get: () => this.$services && this.$services.view,
    },
    $stylesContainer: {
      enumerable: true,
      get: () => this.$services && this.$services.stylesContainer,
    },
  })
}
