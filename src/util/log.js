export function log (...args) {
  console.log('[VueLayers]', ...args)
}

export function warn (msg, ...args) {
  console.warn(`[VueLayers] WARNING: ${msg}`, ...args)
}

export function error (msg, ...args) {
  console.error(`[VueLayers] ERROR: ${msg}`, ...args)
}
