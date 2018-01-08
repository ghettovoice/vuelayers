export function log (...args) {
  console.log('[VueLayers]', ...args)
}

export function warn (msg, ...args) {
  console.warn(`[VueLayers] WARNING: ${msg}`, ...args)
}

export function error (msg, ...args) {
  console.error(`[VueLayers] ERROR: ${msg}`, ...args)
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
