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
