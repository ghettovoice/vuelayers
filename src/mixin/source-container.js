import Vue from 'vue'

const methods = {
  /**
   * @return {{
   *     setSource: function(Source): void,
   *     getSource: function(): Source
   *   }|undefined}
   * @protected
   */
  getSourceTarget () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {Source|undefined}
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
   * @param {Source|Vue|undefined} source
   * @return {void}
   */
  setSource (source) {
    source = source instanceof Vue ? source.$source : source

    if (source !== this._source) {
      this._source = source
    }
    /**
     * @type {Layer|Builder}
     */
    const sourceTarget = this.getSourceTarget()
    if (sourceTarget && source !== sourceTarget.getSource()) {
      sourceTarget.setSource(source)
    }
  },
}

export default {
  methods,
  created () {
    /**
     * @type {Source|undefined}
     * @private
     */
    this._source = undefined
  },
}
