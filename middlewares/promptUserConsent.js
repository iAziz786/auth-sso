async function promptUserConsent(req, res) {
  req.session.oauth2 = req.query
  res.redirect("/oauth/consent")
}

module.exports = promptUserConsent
