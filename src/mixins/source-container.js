import { Source } from 'ol/source'
import { assert, coalesce } from '../utils'

/**
 * @typedef {Source|Object} SourceLike
 */
/**
 * @typedef {Object} SourceTarget
 * @property {function(): Source|undefined} getSource
 * @property {function(Source|undefined): void} setSource
 */

/**
 * Source container mixin.
 */
export default {
  created () {
    /**
     * @type {module:ol/source/Source~Source|undefined}
     * @private
     */
    this._source = undefined
    /**
     * @type {Object|undefined}
     * @private
     */
    this._sourceVm = undefined

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
     * @return {SourceTarget|undefined}
     * @protected
     */
    getSourceTarget () {
      throw new Error(`${this.vmName} not implemented method: getSourceTarget()`)
    },
    /**
     * @return {module:ol/source/Source~Source|undefined}
     */
    getSource () {
      return coalesce(this.getSourceTarget()?.getSource(), this._source)
    },
    /**
     * @return {Object}
     */
    getSourceVm () {
      return this._sourceVm
    },
    /**
     * @param {SourceLike|undefined} source
     */
    setSource (source) {
      source = source?.$source || source
      source || (source = undefined)
      assert(!source || source instanceof Source, 'Invalid source')

      const sourceTarget = this.getSourceTarget()
      if (sourceTarget && source !== sourceTarget.getSource()) {
        sourceTarget.setSource(source)
        this.scheduleRefresh()
      }
      if (source !== this._source) {
        this._source = source
        this._sourceVm = source?.vm && source.vm[0]
        this.scheduleRefresh()
      }
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
