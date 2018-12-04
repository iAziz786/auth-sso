/**
 * @param {String} str
 * @returns {String}
 */
function slashEndValue(str) {
  if (typeof str !== "string" || !str) {
    return ""
  }
  return str.slice(0, str.length - 1)
}

module.exports = slashEndValue
