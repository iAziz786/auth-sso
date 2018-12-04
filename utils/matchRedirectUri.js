const url = require("url")
const slashEndValue = require("./slashEndValue")

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

  return clientRedirectUrls.some((redirect) => {
    const clientUrl = url.parse(redirect)
    const testUrl = url.parse(redirectUrl)
    if (clientUrl.pathname.endsWith("/")) {
      clientUrl.path = slashEndValue(clientUrl.path)
    }
    if (testUrl.pathname.endsWith("/")) {
      redirectUrl.path = slashEndValue(redirectUrl.path)
    }
    return (
      clientUrl.protocol === testUrl.protocol &&
      clientUrl.host === testUrl.host &&
      clientUrl.path === testUrl.path
    )
  })
}

module.exports = mathcRedirectUri
