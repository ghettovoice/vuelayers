import { unByKey } from 'ol/Observable'
import { forEach } from '../util/minilo'

/**
 * Wraps OpenLayers collection to provide indexed access to elements.
 */
export class IndexedCollection {
  /**
   * @param {module:ol/Collection~Collection} collection
   * @param {function} getElementKey
   */
  constructor (collection, getElementKey) {
    this._collection = collection
    this._getElementKey = getElementKey

    this._collection.on('add', ::this._handleAddElement)
    this._collection.on('remove', ::this._handleRemoveElement)

    this._elements = Object.create(null)
    this._elementListeners = Object.create(null)
    this._collection.forEach(element => this._addElementToIndex(this._getElementKey(element), element))
  }

  get collection () {
    return this._collection
  }

  get elements () {
    return this._collection.getArray()
  }

  forEach (iteratee) {
    forEach(this.elements, iteratee)
  }

  add (element) {
    this._collection.push(element)
  }

  remove (element) {
    this._collection.remove(element)
  }

  has (element) {
    return !!this.findByKey(this._getElementKey(element))
  }

  clear () {
    this._collection.clear()
    this._resetIndex()
  }

  findByKey (key) {
    return key && this._elements[key]
  }

  sort (sorter) {
    this.elements.sort(sorter)
  }

  _resetIndex () {
    this._elements = Object.create(null)
  }

  _handleAddElement (evt) {
    this._addElementToIndex(this._getElementKey(evt.element), evt.element)
  }

  _handleRemoveElement (evt) {
    this._removeElementFromIndex(this._getElementKey(evt.element))
  }

  _addElementToIndex (key, element) {
    this._elements[key] = element
    this._elementListeners[key] = element.on('propertychange', ::this._handleElementChange)
  }

  _removeElementFromIndex (key) {
    delete this._elements[key]
    unByKey(this._elementListeners[key])
    delete this._elementListeners[key]
  }

  _handleElementChange ({ target }) {
    let key = this._getElementKey(target)
    // remove by old key
    if (this.findByKey(key) !== target) {
      for (let k in this._elements) {
        if (this._elements[k] === target) {
          this._removeElementFromIndex(k)
          break
        }
      }
    }

    this._addElementToIndex(key, target)
  }
}
