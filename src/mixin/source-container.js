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
  methods: {
    /**
     * @return {Promise<SourceTarget|undefined>}
     * @protected
     */
    getSourceTarget () {
      throw new Error('Not implemented method')
    },
    /**
     * @return {Promise<module:ol/source/Source~Source|undefined>}
     */
    async getSource () {
      return (await this.getSourceTarget()).getSource()
    },
    /**
     * @param {SourceLike|undefined} source
     * @return {void}
     */
    async setSource (source) {
      if (isFunction(source.resolveOlObject)) {
        source = await source.resolveOlObject()
      }

      const sourceTarget = await this.getSourceTarget()
      if (sourceTarget && source !== sourceTarget.getSource()) {
        sourceTarget.setSource(source)
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
