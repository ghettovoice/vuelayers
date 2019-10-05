import Vue from 'vue'

export default {
  created () {
    Object.defineProperties(this, {
      $source: {
        enumerable: true,
        get: this.getSource,
      },
    })
  },
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
     * @return {module:ol/source/Source~Source|undefined}
     */
    getSource () {
      return this._source
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
    /**
     * @param {module:ol/source/Source~Source|Vue|undefined} source
     * @return {void}
     */
    async setSource (source) {
      if (source instanceof Vue) {
        source = await source.resolveOlObject()
      }

      this._source = source
      const sourceTarget = await this.getSourceTarget()

      if (sourceTarget && source !== sourceTarget.getSource()) {
        sourceTarget.setSource(source)
      }
    },
  },
}
