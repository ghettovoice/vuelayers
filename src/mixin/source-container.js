import Vue from 'vue'

export default {
  methods: {
    /**
     * @return {Promise<{
     *     setSource: function(module:ol/source/Source~Source): void,
     *     getSource: function(): module:ol/source/Source~Source
     *   }|undefined>}
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
     * @param {module:ol/source/Source~Source|Vue|undefined} source
     * @return {void}
     */
    async setSource (source) {
      if (source instanceof Vue) {
        source = await source.resolveOlObject()
      }

      const sourceTarget = await this.getSourceTarget()
      if (sourceTarget && source !== sourceTarget.getSource()) {
        sourceTarget.setSource(source)
      }
    },
    /**
     * @returns {Object}
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
