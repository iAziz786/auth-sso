const { Router } = require("express")

const redirectIfAuthenticated = require("../middlewares/redirectIfAuthenticated")

const staticRouter = Router()

const allowedService = [
  { name: "feedwee", follow: "https://feedwee.herokuapp.com" }
]

staticRouter.route("/").get((req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const { name, username, email } = req.user
    return res.render("account", {
      name,
      username,
      email
    })
  }
  res.render("index")
})

staticRouter.route("/login").get(redirectIfAuthenticated, (req, res) => {
  res.render("login")
})

staticRouter.route("/signup").get(redirectIfAuthenticated, (req, res) => {
  res.render("signup")
})

staticRouter.route("/service_login").get((req, res) => {
  const { service, follow } = req.query
  if (!service || !follow) {
    res.redirect("/")
  }
  const didMatch = allowedService.some((serviceDetails) => {
    return (
      serviceDetails.name.toLowerCase() === service.toLowerCase() &&
      serviceDetails.follow.toLowerCase() === follow.toLowerCase()
    )
  })
  if (didMatch) {
    return res.render("service_login")
  }
  return res.redirect("/404")
})

staticRouter.route("/404").get((req, res) => {
  res.render("404")
})

module.exports = staticRouter
