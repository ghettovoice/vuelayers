import { isString } from './minilo'

/* eslint-disable no-console */
export const log = makeLog('[C_PKG_FULLNAME]')

export const warn = makeWarn('[C_PKG_FULLNAME] WARN')

export const error = makeError('[C_PKG_FULLNAME] ERR')
/* eslint-enable no-console */

export function encode (val) {
  return JSON.stringify(val)
}

export function newLogger (prefix = '') {
  return {
    log: makeLog(`[C_PKG_FULLNAME] ${prefix}`),
    warn: makeWarn(`[C_PKG_FULLNAME] WARN ${prefix}`),
    error: makeError(`[C_PKG_FULLNAME] ERR ${prefix}`),
  }
}

export function makeLog (prefix = '') {
  return function (...args) {
    if (prefix) {
      if (isString(args[0])) {
        args[0] = prefix.trim() + ' ' + args[0]
      } else {
        args = [prefix.trim(), ...args]
      }
    }
    console.log(...args)
  }
}

export function makeWarn (prefix = '') {
  return function (...args) {
    if (prefix) {
      if (isString(args[0])) {
        args[0] = prefix.trim() + ' ' + args[0]
      } else {
        args = [prefix.trim(), ...args]
      }
    }
    console.warn(...args)
  }
}

export function makeError (prefix = '') {
  return function (...args) {
    if (prefix) {
      if (isString(args[0])) {
        args[0] = prefix.trim() + ' ' + args[0]
      } else {
        args = [prefix.trim(), ...args]
      }
    }
    console.error(...args)
  }
}
