import { differenceWith } from 'lodash/fp'

export const diffById = differenceWith((a, b) => a.id === b.id)
export const idMatchFilter = id => x => x.id === id
export const noop = () => {}
export const identity = x => x
export const constant = x => () => x

/**
 * @param {*} value
 * @return {boolean} True if value is number or numeric string.
 */
export function isNumeric (value) {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

/**
 * @param {*} value
 * @return {boolean}
 */
export function isArray (value) {
  return Array.isArray(value)
}

export function isFunction (value) {
  return typeof value === 'function'
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
 * @param {number} num
 * @param {number} [precision=0]
 * @return {number}
 */
export function round (num, precision = 0) {
  return Number(Math.round(Number(num + 'e+' + precision)) + 'e-' + precision)
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

  return string.replace(regExp, match => replaces[ match.substr(1, match.length - 2) ] || '')
}

// Copyright 2009 Nicholas C. Zakas. All rights reserved.
// MIT Licensed
export function timedChunk (items, process, processContext, callback, callbackContext) {
  return new Promise(resolve => {
    let todo = items.slice() // create a clone of the original

    let exec = function () {
      let start = Date.now()

      do {
        process.call(processContext, todo.shift())
      } while (todo.length > 0 && (Date.now() - start < 50))

      if (todo.length > 0) {
        setTimeout(exec, 25)
      } else {
        if (typeof callback === 'function') {
          callback.call(callbackContext, items)
        }
        resolve(items)
      }
    }

    if (todo.length) {
      setTimeout(exec, 25)
    } else {
      resolve(items)
    }
  })
}

export function delay (dt) {
  return new Promise(resolve => setTimeout(resolve, dt))
}
