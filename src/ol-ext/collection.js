/**
 * Wraps OpenLayers collection to provide indexed access to elements.
 */
export class IndexedCollectionAdapter {
  /**
   * @param {ol.Collection} collection
   * @param {function} getElementKey
   */
  constructor (collection, getElementKey) {
    /**
     * @type {ol.Collection}
     * @private
     */
    this._adaptee = collection
    /**
     * @type {Function}
     * @private
     */
    this._getElementKey = getElementKey
    /**
     * @type {Object<mixed, number>}
     * @private
     */
    this._index = Object.create(null)

    this._adaptee.forEach((element, idx) => {
      let key = this._getElementKey(element)
      this._index[key] = idx
    })
  }

  /**
   * @return {ol.Collection}
   */
  get adaptee () {
    return this._adaptee
  }

  get elements () {
    return this._adaptee.getArray()
  }

  /**
   * @param {function} iteratee
   */
  forEach (iteratee) {
    this._adaptee.forEach(iteratee)
  }

  /**
   * @param {*} element
   */
  add (element) {
    let key = this._getElementKey(element)
    if (key == null) return

    let length = this._adaptee.push(element)
    this._index[key] = length - 1
  }

  /**
   * @param {*} element
   */
  remove (element) {
    let key = this._getElementKey(element)
    if (!key) return

    if (this._adaptee.remove(element)) {
      delete this._index[key]
    }
  }

  /**
   * @param {*} element
   * @return {boolean}
   */
  has (element) {
    return !!this.findByKey(this._getElementKey(element))
  }

  /**
   * @return {void}
   */
  clear () {
    this._adaptee.clear()
    this._index = Object.create(null)
  }

  /**
   * @param {*} key
   * @return {*|undefined}
   */
  findByKey (key) {
    if (this._index[key] == null) return

    return this._adaptee.item(this._index[key])
  }

  /**
   * @param {function} sorter
   */
  sort (sorter) {
    this.elements.sort(sorter)
  }
}

/**
 * Wraps vector source to provide collection like API.
 */
export class SourceCollectionAdapter {
  /**
   * @param {ol.source.Vector} source
   */
  constructor (source) {
    /**
     * @type {ol.source.Vector}
     * @private
     */
    this._adaptee = source
  }

  /**
   * @return {ol.source.Vector}
   */
  get adaptee () {
    return this._adaptee
  }

  /**
   * @return {Array<ol.Feature>}
   */
  get elements () {
    return this._adaptee.getFeatures()
  }

  /**
   * @param {function} iteratee
   */
  forEach (iteratee) {
    this.elements.forEach(iteratee)
  }

  /**
   * @param {ol.Feature} feature
   */
  add (feature) {
    this._adaptee.addFeature(feature)
  }

  /**
   * @param {ol.Feature} feature
   */
  remove (feature) {
    this._adaptee.removeFeature(feature)
  }

  /**
   * @param {ol.Feature} feature
   * @return {boolean}
   */
  has (feature) {
    return !!this.findByKey(feature.getId())
  }

  /**
   * @return {void}
   */
  clear () {
    this._adaptee.clear()
  }

  /**
   * @param {*} key
   * @return {ol.Feature|undefined}
   */
  findByKey (key) {
    return this._adaptee.getFeatureById(key)
  }

  /**
   * @param {function} sorter
   */
  sort (sorter) {
    throw new Error('Not supported')
  }
}
