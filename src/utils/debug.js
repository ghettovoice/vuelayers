/* global PKG_FULLNAME */

export function warn (msg, ...args) {
  console.warn(`[${PKG_FULLNAME}] WARNING: ${msg}`, ...args)
}
