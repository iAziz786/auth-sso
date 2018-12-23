/**
 *
 * @param {String} candidateSecret
 * @returns {Boolean} Wheather provided secret matched with the secret stored
 */
function didSecretMatch(candidateSecret) {
  const user = this

  if (typeof candidateSecret !== "string") {
    return false
  }

  if (!candidateSecret) {
    return false
  }

  return candidateSecret === user.clientSecret
}

module.exports = didSecretMatch
