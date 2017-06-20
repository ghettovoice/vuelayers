/* global PKG_FULLNAME */

export function log (...args) {
  console.log(`[${PKG_FULLNAME}]`, ...args)
}

export function warn (msg, ...args) {
  console.warn(`[${PKG_FULLNAME}] WARNING: ${msg}`, ...args)
}

export function error (msg, ...args) {
  console.error(`[${PKG_FULLNAME}] ERROR: ${msg}`, ...args)
}

export function logdbg (...args) {
  if (process.env.NODE_ENV !== 'production') {
    log(...args)
  }
}

export function warndbg (...args) {
  if (process.env.NODE_ENV !== 'production') {
    warn(...args)
  }
}

export function errordbg (...args) {
  if (process.env.NODE_ENV !== 'production') {
    error(...args)
  }
}
