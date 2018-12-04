/**
 * @return {String} Return an randomly generated token
 */
function generateToken() {
  return Math.random()
    .toString(36)
    .substring(2)
}

module.exports = generateToken
