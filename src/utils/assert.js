/**
 * Assertion helpers
 * @module utils/assert
 */
import assert from 'assert'
import isNumeric from './is-numeric'

export const {
  ok,
  fail,
  equal,
  notEqual,
  AssertionError
} = assert
/**
 * @param {*} value
 * @throws {AssertionError}
 */
export function numeric (value) {
  assert(isNumeric(value), 'value is a number')
}

/**
 * @param {*} value
 * @param {Function} Ctor
 * @throws {AssertionError}
 */
export function instanceOf (value, Ctor) {
  assert(value instanceof Ctor, `value is an instance of ${Ctor.name}`)
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasMap (vm) {
  assert(vm.$map, 'component has "$map" property')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasView (vm) {
  assert(vm.$view, 'component has "$view" property')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasGeolocation (vm) {
  assert(vm.$geolocation, 'component has "$geolocation" property')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasFeature (vm) {
  assert(vm.$feature, 'component has "$feature" property')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasLayer (vm) {
  assert(vm.$layer, 'component has "$layer" property')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasSource (vm) {
  assert(vm.$source, 'component has "$source" property')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasGeometry (vm) {
  assert(vm.$geometry, 'component has "$geometry" property')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasInteraction (vm) {
  assert(vm.$interaction, 'component has "$interaction" property')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasStyle (vm) {
  assert(vm.$style, 'component has "$style" property')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasOverlay (vm) {
  assert(vm.$overlay, 'component has "$overlay" property')
}
