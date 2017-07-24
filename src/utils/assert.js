/**
 * Assertion helpers
 * @module utils/assert
 */
import assert from 'assert'
import isNumeric from './is-numeric'

const { ok, fail, equal, notEqual } = assert
export {
  ok,
  fail,
  equal,
  notEqual
}
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
  assert(vm.map, 'component has "map" field')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasView (vm) {
  assert(vm.view, 'component has "view" field')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasGeolocation (vm) {
  assert(vm.geolocation, 'component has "geolocation" field')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasFeature (vm) {
  assert(vm.feature, 'component has "feature" field')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasLayer (vm) {
  assert(vm.layer, 'component has "layer" field')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasSource (vm) {
  assert(vm.source, 'component has "source" field')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasGeometry (vm) {
  assert(vm.geometry, 'component has "geom" field')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasInteraction (vm) {
  assert(vm.interaction, 'component has "interaction" field')
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {AssertionError}
 */
export function hasStyle (vm) {
  assert(vm.style, 'component has "style" field')
}
