import { interval as intervalObs } from 'rxjs/Observable'
import { Collection } from 'ol'
import { first as firstObs, map as mapObs, skipWhile } from 'rxjs/operators'

/**
 * Mini Lodash.
 */
const glob = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : {}
const globIsFinite = glob.isFinite || noop

const objectProto = Object.prototype
const funcProto = Object.prototype

const objectToString = objectProto.toString
const objectHasOwnProp = objectProto.hasOwnProperty
const funcToString = funcProto.toString

const objectTag = {}::objectToString()
const numberTag = 0::objectToString()
const stringTag = ''::objectToString()
const booleanTag = true::objectToString()

const objectCtorString = Object::funcToString()

export function noop () {
  // do nothing
}

export function constant (value) {
  return () => value
}

export function stubArray () {
  return []
}

export function stubObject () {
  return Object.create(null)
}

export function stubCollection () {
  return new Collection()
}

export function identity (value) {
  return value
}

export function negate (func) {
  return function (...args) {
    return !func(...args)
  }
}

export function toArray (value) {
  return Array.from(value)
}

export function isBoolean (value) {
  return value::objectToString() === booleanTag
}

export function isNumber (value) {
  return value::objectToString() === numberTag
}

export function isString (value) {
  return value::objectToString() === stringTag
}

export function isArray (value) {
  return Array.isArray(value)
}

export function isArrayLike (value) {
  return isObjectLike(value) && value::objectHasOwnProp('length')
}

export function isCollection (value) {
  return value instanceof Collection
}

export function isFinite (value) {
  return typeof value === 'number' && globIsFinite(value)
}

export function isFunction (value) {
  return typeof value === 'function'
}

/**
 * @param {*} value
 * @return {boolean} True if value is number or numeric string.
 */
export function isNumeric (value) {
  return !isNaN(parseFloat(value)) && globIsFinite(value)
}

export function isObjectLike (value) {
  return value != null && typeof value === 'object'
}

export function isPlainObject (value) {
  if (!isObjectLike(value) || value::objectToString() !== objectTag) {
    return false
  }
  const proto = Object.getPrototypeOf(value)
  if (proto == null) {
    return true
  }
  const Ctor = proto.constructor
  return typeof Ctor === 'function' &&
    Ctor instanceof Ctor &&
    Ctor::funcToString() === objectCtorString
}

/**
 * @param {...*} [args]
 *
 * @return {*}
 */
export function coalesce (...args) {
  return args.find(val => val != null)
}

/**
 * @param {Object} object
 * @return {Object} Returns object only with plain properties.
 */
export function plainProps (object) {
  const newObject = {}
  const isPlain = x => isNumeric(x) || isString(x) || isArray(x) || isBoolean(x) || isPlainObject(x)
  Object.keys(object).forEach(key => {
    if (isPlain(object[key])) {
      newObject[key] = object[key]
    }
  })
  return newObject
}

/**
 * Replaces `tokens` in the `string` by values from the `replaces`.
 *
 * @param {string} string
 * @param {Object} replaces
 *
 * @returns {string}
 */
export function replaceTokens (string, replaces) {
  const regExp = new RegExp(Object.keys(replaces).map(field => '(\\{' + field + '\\})').join('|'), 'ig')

  return string.replace(regExp, match => replaces[match.substr(1, match.length - 2)] || '')
}

export function isEqual (value, other) {
  if (value === other) {
    return true
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    // eslint-disable-next-line no-self-compare
    return value !== value && other !== other
  }

  const valueProps = Object.keys(value)
  const otherProps = Object.keys(other)
  if (valueProps.length !== otherProps.length) {
    return false
  }

  const checked = []
  const traverse = (valueProps, otherProps) => {
    for (let i = 0, l = valueProps.length; i < l; i++) {
      const valueProp = valueProps[i]

      if (checked.includes(valueProp)) {
        continue
      }
      if (other::objectHasOwnProp(valueProp) === false) {
        return false
      }

      const otherProp = otherProps[i]

      if (!isEqual(value[valueProp], other[otherProp])) {
        return false
      }

      checked.push(otherProp)
    }

    return true
  }

  if (traverse(valueProps, otherProps) === false) {
    return false
  }

  return traverse(otherProps, valueProps)
}

export function getLength (value) {
  if (isCollection(value)) {
    value = value.getArray()
  }
  if (isArrayLike(value)) {
    return value.length
  }
  return 0
}

export function isEmpty (value) {
  if (isCollection(value)) {
    value = value.getArray()
  }
  if (isObjectLike(value)) {
    value = Object.values(value).filter(negate(isEmpty))
  }
  return !value || (isArrayLike(value) && getLength(value) === 0)
}

export function keys (object) {
  return Object.keys(object)
}

export function values (object) {
  return Object.values(object)
}

export function seal (object) {
  return Object.seal(object)
}

export function freeze (object) {
  return Object.freeze(object)
}

export function sealFactory (factory) {
  return function (...args) {
    return seal(factory(...args))
  }
}

export function freezeFactory (factory) {
  return function (...args) {
    return freeze(factory(...args))
  }
}

export function forEach (collection, iteratee) {
  if (isCollection(collection)) {
    collection = collection.getArray()
  }
  const keys = Object.keys(collection)
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    const value = collection[key]
    if (iteratee(value, key) === false) {
      return
    }
  }
}

export function reduce (collection, iteratee, initial) {
  let result = initial
  forEach(collection, (value, key) => {
    result = iteratee(result, value, key)
  })
  return result
}

export function filter (collection, iteratee = negate(isEmpty)) {
  return reduce(collection, (newCollection, value, key) => {
    if (iteratee(value, key)) {
      if (isArray(newCollection)) {
        newCollection.push(value)
      } else {
        newCollection[key] = value
      }
    }
    return newCollection
  }, isArrayLike(collection) || isCollection(collection) ? [] : {})
}

export function map (collection, iteratee = identity) {
  return reduce(collection, (newCollection, value, key) => {
    newCollection[key] = iteratee(value, key)
    return newCollection
  }, isArrayLike(collection) || isCollection(collection) ? [] : {})
}

export function mapValues (object, iteratee = identity) {
  return map(object, iteratee)
}

export function mapKeys (object, iteratee = identity) {
  return reduce(object, (newObject, value, key) => {
    newObject[iteratee(value, key)] = value
    return newObject
  }, {})
}

export function firstEl (object) {
  if (isCollection(object)) {
    object = object.getArray()
  }
  if (!isArrayLike(object)) return

  return object[0]
}

export function lastEl (object) {
  if (isCollection(object)) {
    object = object.getArray()
  }
  if (!isArrayLike(object)) return

  return object[object.length - 1]
}

export function pick (object, key, ...keys) {
  if (Array.isArray(key)) {
    keys = key
  } else {
    keys = [key].concat(keys)
  }
  return reduce(keys, (picked, key) => {
    picked[key] = object[key]
    return picked
  }, {})
}

export function omit (object, key, ...keys) {
  if (Array.isArray(key)) {
    keys = key
  } else {
    keys = [key].concat(keys)
  }
  return filter(object, (value, key) => !keys.includes(key))
}

export function upperFirst (string) {
  string = String(string)
  if (string.length === 0) {
    return ''
  }
  return string[0].toUpperCase() + string.slice(1)
}

export function lowerFirst (string) {
  string = String(string)
  if (string.length === 0) {
    return ''
  }
  return string[0].toLowerCase() + string.slice(1)
}

export function* range (start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i
  }
}

export function get (object, path, defaultValue) {
  // eslint-disable-next-line no-new-func
  const fn = new Function('object', `try { return object.${path} } catch (e) {}`)
  return coalesce(fn(object), defaultValue)
}

export function hasOwnProp (object, prop) {
  return isObjectLike(object) && object::objectHasOwnProp(prop)
}

export function hasProp (object, prop) {
  return isObjectLike(object) && (prop in object)
}

export function includes (array, value, comparator = isEqual) {
  const elems = filter(array, elem => comparator(elem, value))
  return elems.shift()
}

export function difference (array1, array2, comparator = isEqual) {
  return filter(array1, value => !includes(array2, value, comparator))
}

/**
 * @param {string} str
 * @return {string}
 */
export function camelCase (str) {
  const regExp = /([-_]\w)/g
  return str.replace(regExp, matches => matches[1].toUpperCase())
}

/**
 * @param {string} str
 * @returns {string}
 */
export function kebabCase (str) {
  return str.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
    .filter(Boolean)
    .map(x => x.toLowerCase())
    .join('-')
}

/**
 * @param {function} condition
 * @returns {Promise<boolean>}
 */
export function waitFor (condition) {
  return intervalObs(1000 / 60).pipe(
    skipWhile(negate(condition)),
    firstObs(),
    mapObs(() => true),
  ).toPromise(Promise)
}
