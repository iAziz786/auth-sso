/**
 * @returns {Boolean} return whether authorization code has expired or not
 */
function hasExpired() {
  const user = this
  if (Date.now() > user.expiresAt) {
    return true
  }
  return false
}

module.exports = hasExpired
