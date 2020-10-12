import debounce from 'debounce-promise'
import { getSourceId } from '../ol-ext'
import { isFunction } from '../utils'
import { FRAME_TIME } from './ol-cmp'

/**
 * Source container mixin.
 */
export default {
  computed: {
    currentSource () {
      if (!(this.rev && this.$source)) return

      return getSourceId(this.$source)
    },
  },
  watch: {
    currentSource: debounce(function (value, prev) {
      if (value === prev) return

      this.$emit('update:source', value)
    }, FRAME_TIME),
  },
  created () {
    /**
     * @type {module:ol/source/Source~Source|undefined}
     * @private
     */
    this._source = null
    /**
     * @type {Object|undefined}
     * @private
     */
    this._sourceVm = null

    this::defineServices()
  },
  methods: {
    /**
     * @returns {{readonly sourceContainer: Object}}
     * @protected
     */
    getServices () {
      const vm = this

      return {
        get sourceContainer () { return vm },
      }
    },
    /**
     * @return {Promise<SourceTarget|undefined>}
     * @protected
     */
    getSourceTarget () {
      throw new Error(`${this.vmName} not implemented method: getSourceTarget()`)
    },
    /**
     * @return {module:ol/source/Source~Source|undefined}
     */
    getSource () {
      return this._source
    },
    /**
     * @return {Object}
     */
    getSourceVm () {
      return this._sourceVm
    },
    /**
     * @param {SourceLike|undefined} source
     * @return {void}
     */
    async setSource (source) {
      if (isFunction(source?.resolveOlObject)) {
        source = await source.resolveOlObject()
      }
      source || (source = null)

      if (source === this._source) return

      const sourceTarget = await this.getSourceTarget()
      if (!sourceTarget) return

      this._source = source
      this._sourceVm = source?.vm && source.vm[0]
      await sourceTarget.setSource(source)
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $source: {
      enumerable: true,
      get: this.getSource,
    },
    $sourceVm: {
      enumerable: true,
      get: this.getSourceVm,
    },
  })
}
