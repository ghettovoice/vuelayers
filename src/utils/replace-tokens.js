import { mapKeys } from 'lodash/fp'

/**
 * Replaces `tokens` in the `string` by values from the `replaces`.
 *
 * @param {string} string
 * @param {Object} replaces
 *
 * @returns {string}
 */
export default function replaceTokens (string, replaces) {
  const regExp = new RegExp(mapKeys(field => '(\\{' + field + '\\})', replaces).join('|'), 'ig')

  return string.replace(regExp, match => replaces[ match.substr(1, match.length - 2) ] || '')
}
