import Collection from 'ol/collection'
/**
 * Wraps OpenLayers collection to provide indexed access to elements.
 */
export class IndexedCollectionAdapter {
  /**
   * @param {ol.Collection} collection
   * @param {function} extractKey
   */
  constructor (collection, extractKey) {
    /**
     * @type {ol.Collection}
     * @private
     */
    this._adaptee = collection
    if (this._adaptee instanceof Collection) {
      throw new Error('Invalid collection provided')
    }
    /**
     * @type {Function}
     * @private
     */
    this._extractKey = extractKey
    /**
     * @type {Object<mixed, number>}
     * @private
     */
    this._index = Object.create(null)

    this._adaptee.forEach((element, idx) => {
      let key = this._extractKey(element)
      this._index[key] = idx
    })
  }

  /**
   * @return {ol.Collection}
   */
  getAdaptee () {
    return this._adaptee
  }

  /**
   * @param {*} element
   */
  add (element) {
    let key = this._extractKey(element)
    if (key == null) return

    let length = this._adaptee.push(element)
    this._index[key] = length - 1
  }

  /**
   * @param {*} element
   */
  remove (element) {
    let key = this._extractKey(element)
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
    return !!this.getById(this._extractKey(element))
  }

  /**
   * @return {void}
   */
  clear () {
    this._adaptee.clear()
    this._index = Object.create(null)
  }

  /**
   * @param {*} id
   * @return {ol.Feature|undefined}
   */
  getById (id) {
    if (this._index[id] == null) return

    return this._adaptee.item(this._index[id])
  }

  /**
   * @return {ol.Feature[]}
   */
  all () {
    return this._adaptee.getArray()
  }
}
