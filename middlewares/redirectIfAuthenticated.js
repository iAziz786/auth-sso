function redirectIfAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect("back")
  }
  next()
}

module.exports = redirectIfAuthenticated
