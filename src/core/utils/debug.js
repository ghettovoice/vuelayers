export function log (...args) {
  console.log('[C_PKG_FULLNAME]', ...args)
}

export function warn (msg, ...args) {
  console.warn(`[C_PKG_FULLNAME] WARNING: ${msg}`, ...args)
}

export function error (msg, ...args) {
  console.error(`[C_PKG_FULLNAME] ERROR: ${msg}`, ...args)
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
