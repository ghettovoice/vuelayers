import Vue from 'vue'

export default {
  methods: {
    /**
     * @return {{
     *     setSource: function(module:ol/source/Source~Source): void,
     *     getSource: function(): module:ol/source/Source~Source
     *   }|undefined}
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
    setSource (source) {
      source = source instanceof Vue ? source.$source : source
      if (source !== this._source) {
        this._source = source
      }
      /**
       * @type {module:ol/layer/Layer~Layer|Builder}
       */
      const sourceTarget = this.getSourceTarget()
      if (sourceTarget && source !== sourceTarget.getSource()) {
        sourceTarget.setSource(source)
      }
    },
  },
}
