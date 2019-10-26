import { isNumeric } from './minilo'

export class AssertionError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}

/**
 * @param {*} value
 * @param {string} message
 * @throws AssertionError
 */
export function assert (value, message) {
  if (!value) {
    throw new AssertionError(message || 'Assertion failed')
  }
}

/**
 * Alias of `assert` function.
 * @param value
 * @param message
 */
export function ok (value, message) {
  return assert(value, message)
}

/**
 * @param {*} value
 * @param {string|undefined} [msg]
 * @throws {AssertionError}
 */
export function numeric (value, msg) {
  assert(isNumeric(value), msg || 'value is a number')
}

/**
 * @param {*} value
 * @param {Function} Ctor
 * @param {string|undefined} [msg]
 * @throws {AssertionError}
 */
export function instanceOf (value, Ctor, msg) {
  assert(value instanceof Ctor, msg || `value is an instance of ${Ctor.name}`)
}

/**
 * @param {Object} vm
 * @param {string|undefined} [msg]
 * @return {void}
 * @throws {AssertionError}
 */
export function hasMap (vm, msg) {
  assert(vm.$map, msg || 'component has "$map" property')
}

/**
 * @param {Object} vm
 * @param {string|undefined} [msg]
 * @return {void}
 * @throws {AssertionError}
 */
export function hasView (vm, msg) {
  assert(vm.$view, msg || 'component has "$view" property')
}

/**
 * @param {Object} vm
 * @param {string|undefined} [msg]
 * @return {void}
 * @throws {AssertionError}
 */
export function hasGeolocation (vm, msg) {
  assert(vm.$geolocation, msg || 'component has "$geolocation" property')
}

/**
 * @param {Object} vm
 * @param {string|undefined} [msg]
 * @return {void}
 * @throws {AssertionError}
 */
export function hasFeature (vm, msg) {
  assert(vm.$feature, msg || 'component has "$feature" property')
}

/**
 * @param {Object} vm
 * @param {string|undefined} [msg]
 * @return {void}
 * @throws {AssertionError}
 */
export function hasLayer (vm, msg) {
  assert(vm.$layer, msg || 'component has "$layer" property')
}

/**
 * @param {Object} vm
 * @param {string|undefined} [msg]
 * @return {void}
 * @throws {AssertionError}
 */
export function hasSource (vm, msg) {
  assert(vm.$source, msg || 'component has "$source" property')
}

/**
 * @param {Object} vm
 * @param {string|undefined} [msg]
 * @return {void}
 * @throws {AssertionError}
 */
export function hasGeometry (vm, msg) {
  assert(vm.$geometry, msg || 'component has "$geometry" property')
}

/**
 * @param {Object} vm
 * @param {string|undefined} [msg]
 * @return {void}
 * @throws {AssertionError}
 */
export function hasInteraction (vm, msg) {
  assert(vm.$interaction, msg || 'component has "$interaction" property')
}

/**
 * @param {Object} vm
 * @param {string|undefined} [msg]
 * @return {void}
 * @throws {AssertionError}
 */
export function hasStyle (vm, msg) {
  assert(vm.$style, msg || 'component has "$style" property')
}

/**
 * @param {Object} vm
 * @param {string|undefined} [msg]
 * @return {void}
 * @throws {AssertionError}
 */
export function hasOverlay (vm, msg) {
  assert(vm.$overlay, msg || 'component has "$overlay" property')
}
