/**
 * @param {*} value
 * @return {boolean} True if value is number or numeric string.
 */
export default function isNumeric (value) {
  return !isNaN(parseFloat(value)) && isFinite(value)
}
