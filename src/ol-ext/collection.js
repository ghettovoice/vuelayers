import eventType from 'ol/events/eventtype'
import { forEach } from '../util/minilo'

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

    this._adaptee.forEach(element => this._addToIndex(this._getElementKey(element), element))
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
    forEach(this.elements, iteratee)
  }

  /**
   * @param {*} element
   */
  add (element) {
    let key = this._getElementKey(element)

    if (key != null) {
      this._adaptee.push(element)
      this._index[key] = element
    }
  }

  /**
   * @param {*} element
   */
  remove (element) {
    if (this._adaptee.remove(element)) {
      this._removeFromIndex(this._getElementKey(element))
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
    this._resetIndex()
  }

  /**
   * @param {*} key
   * @return {*|undefined}
   */
  findByKey (key) {
    return key && this._index[key]
  }

  /**
   * @param {function} sorter
   */
  sort (sorter) {
    this.elements.sort(sorter)
  }

  /**
   * @private
   */
  _resetIndex () {
    this._index = Object.create(null)
  }

  /**
   * @param {string} key
   * @param {*} element
   * @private
   */
  _addToIndex (key, element) {
    if (key == null) {
      return false
    }

    this._index[key] = element
    element.on(eventType.PROPERTYCHANGE, this._handleElementChange, this)

    return true
  }

  /**
   * @param {string} key
   * @private
   */
  _removeFromIndex (key) {
    let element = this.findByKey(key)

    if (element) {
      element.un(eventType.PROPERTYCHANGE, this._handleElementChange, this)
      delete this._index[key]
    }

    return !!element
  }

  /**
   * Updates index
   * @param {*} target
   * @private
   */
  _handleElementChange ({ target }) {
    let key = this._getElementKey(target)
    // remove by old key
    if (this.findByKey(key) !== target) {
      for (let k in this._index) {
        if (this._index[k] === target) {
          this._removeFromIndex(k)
          break
        }
      }
    }

    this._addToIndex(key, target)
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
