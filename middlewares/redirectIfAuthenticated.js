function redirectIfAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const redirectTo = req.redirectTo || "/"
    return res.redirect(redirectTo)
  }
  next()
}

module.exports = redirectIfAuthenticated
