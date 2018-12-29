const login = require("connect-ensure-login")

function ensureLoggedIn(req, res, next) {
  return login.ensureLoggedIn({
    redirectTo: `/login`
  })(req, res, next)
}

module.exports = ensureLoggedIn
