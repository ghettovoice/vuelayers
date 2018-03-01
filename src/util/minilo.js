/**
 * Mini Lodash.
 * @module util/minilo
 */
const objectProto = Object.prototype
const funcProto = Object.prototype

const objectToString = objectProto.toString
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

export function identity (value) {
  return value
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

export function isFinite (value) {
  return typeof value === 'number' && global.isFinite(value)
}

export function isFunction (value) {
  return typeof value === 'function'
}

/**
 * @param {*} value
 * @return {boolean} True if value is number or numeric string.
 */
export function isNumeric (value) {
  return !isNaN(parseFloat(value)) && global.isFinite(value)
}

export function isObjectLike (value) {
  return value != null && typeof value === 'object'
}

export function isPlainObject (value) {
  if (!isObjectLike(value) || value::objectToString() !== objectTag) {
    return false
  }
  let proto = Object.getPrototypeOf(value)
  if (proto == null) {
    return true
  }
  let Ctor = proto.constructor
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
  let newObject = {}
  let isPlain = x => isNumeric(x) || isString(x) || isArray(x) || isBoolean(x) || isPlainObject(x)
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

  let valueProps = Object.keys(value)
  let otherProps = Object.keys(other)
  if (valueProps.length !== otherProps.length) {
    return false
  }

  let checked = []
  let traverse = (valueProps, otherProps) => {
    for (let i = 0, l = valueProps.length; i < l; i++) {
      let valueProp = valueProps[i]

      if (checked.indexOf(valueProp) !== -1) {
        continue
      }
      if (other.hasOwnProperty(valueProp) === false) {
        return false
      }

      let otherProp = otherProps[i]

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
