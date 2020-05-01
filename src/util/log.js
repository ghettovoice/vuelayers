export const log = console.log.bind(console, '[C_PKG_FULLNAME]')

export const warn = console.warn.bind(console, '[C_PKG_FULLNAME] WARN')

export const error = console.error.bind(console, '[C_PKG_FULLNAME] ERR')

export function encode (val) {
  return JSON.stringify(val)
}

export function newLogger (prefix = '') {
  return {
    log: log.bind(log, prefix),
    warn: warn.bind(warn, prefix),
    error: error.bind(error, prefix),
  }
}
