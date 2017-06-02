/**
 * Assertion helpers
 * @module utils/assert
 */
import isNumeric from './is-numeric'

/**
 * @param {*} value
 * @throws {Error}
 */
export function assertNumeric (value) {
  if (!isNumeric(value)) {
    throw new Error('Assertion failed: value is a number')
  }
}

/**
 * @param {*} value
 * @param {Function} Ctor
 * @throws {Error}
 */
export function assertInstance (value, Ctor) {
  if (!(value instanceof Ctor)) {
    throw new Error('Assertion failed: value is an instance of ' + Ctor.name)
  }
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {Error}
 */
export function assertHasMap (vm) {
  if (!vm.map) {
    throw new Error('Assertion failed: component has "map" field')
  }
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {Error}
 */
export function assertHasView (vm) {
  if (!vm.view) {
    throw new Error('Assertion failed: component has "view" field')
  }
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {Error}
 */
export function assertHasGeoloc (vm) {
  if (!vm.geoloc) {
    throw new Error('Assertion failed: component has "geoloc" field')
  }
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {Error}
 */
export function assertHasFeature (vm) {
  if (!vm.feature) {
    throw new Error('Assertion failed: component has "feature" field')
  }
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {Error}
 */
export function assertHasLayer (vm) {
  if (!vm.layer) {
    throw new Error('Assertion failed: component has "layer" field')
  }
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {Error}
 */
export function assertHasSource (vm) {
  if (!vm.source) {
    throw new Error('Assertion failed: component has "source" field')
  }
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {Error}
 */
export function assertHasGeom (vm) {
  if (!vm.geom) {
    throw new Error('Assertion failed: component has "geom" field')
  }
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {Error}
 */
export function assertHasInteraction (vm) {
  if (!vm.interaction) {
    throw new Error('Assertion failed: component has "interaction" field')
  }
}

/**
 * @param {Object} vm
 * @return {void}
 * @throws {Error}
 */
export function assertHasStyle (vm) {
  if (!vm.style) {
    throw new Error('Assertion failed: component has "style" field')
  }
}
