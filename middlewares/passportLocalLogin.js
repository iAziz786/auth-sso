const passport = require("passport")

function passportLocalLogin(req, res, next) {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(403).json({
      error: true,
      message: "username or password not provided"
    })
  }

  passport.authenticate("local", (err, user) => {
    if (err) {
      next(err)
    }

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "authentication failed"
      })
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      }
      if (req.session && req.session.returnTo) {
        return res.redirect(req.session.returnTo)
      }
      next()
    })
  })(req, res, next)
}

module.exports = passportLocalLogin
