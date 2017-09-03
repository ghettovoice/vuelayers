import Vue from 'vue'

const methods = {
  /**
   * @return {{
   *     setSource: function(ol.source.Source): void,
   *     getSource: function(): ol.source.Source
   *   }|undefined}
   * @protected
   */
  getSourceTarget () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {ol.source.Source|undefined}
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
      get sourceContainer () { return vm }
    }
  },
  /**
   * @param {ol.source.Source|Vue|undefined} source
   * @return {void}
   */
  setSource (source) {
    source = source instanceof Vue ? source.$source : source

    if (source !== this._source) {
      this._source = source
    }

    const sourceTarget = this.getSourceTarget()
    if (sourceTarget && source !== sourceTarget.getSource()) {
      sourceTarget.setSource(source)
    }
  }
}

export default {
  methods,
  created () {
    /**
     * @type {ol.source.Source|undefined}
     * @private
     */
    this._source = undefined
  },
  destroyed () {
    this._source = undefined
  }
}
