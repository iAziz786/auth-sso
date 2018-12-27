/**
 * @author Mohammad Aziz
 * @param {Array<string>} clientRedirectUrls
 * @param {string} redirectUrl
 * @returns {boolean}
 */
function mathcRedirectUri(clientRedirectUrls, redirectUrl) {
  if (!redirectUrl) {
    return false
  }

  if (!Array.isArray(clientRedirectUrls)) {
    clientRedirectUrls = [clientRedirectUrls]
  }

  return clientRedirectUrls.some((registeredUri) => {
    return registeredUri === redirectUrl
  })
}

module.exports = mathcRedirectUri
