import { isFunction } from '../util/minilo'

/**
 * @typedef {module:ol/source/Source~Source|Object} SourceLike
 */
/**
 * @typedef {Object} SourceTarget
 * @property {function(module:ol/source/Source~Source): void} setSource
 * @property {function(): module:ol/source/Source~Source} getSource
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
     * @return {Promise<SourceTarget|undefined>}
     * @protected
     */
    getSourceTarget () {
      throw new Error('Not implemented method: getSourceTarget')
    },
    /**
     * @return {module:ol/source/Source~Source|undefined}
     */
    getSource () {
      return this._source
    },
    /**
     * @param {SourceLike|undefined} source
     * @return {void}
     */
    async setSource (source) {
      let sourceVm
      if (source && isFunction(source.resolveOlObject)) {
        sourceVm = source
        source = await source.resolveOlObject()
      }

      const sourceTarget = await this.getSourceTarget()
      if (sourceTarget && source !== sourceTarget.getSource()) {
        sourceTarget.setSource(source)
        this._source = source
        this._sourceVm = sourceVm || (source?.vm && source.vm[0])
      }
    },
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
  },
}

function defineServices () {
  Object.defineProperties(this, {
    /**
     * @type {module:ol/source/Source~Source|undefined}
     */
    $source: {
      enumerable: true,
      get: this.getSource,
    },
    $sourceVm: {
      enumerable: true,
      get: () => this._sourceVm,
    },
  })
}
