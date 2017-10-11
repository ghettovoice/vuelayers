exports.nameToIdent = string => string.replace(/^module:/, '').replace('/', '-').toLowerCase()
