const path = require("path")
const { Router } = require("express")
const login = require("connect-ensure-login")

const { Client } = require("../components/client/modal")
const redirectIfAuthenticated = require("../middlewares/redirectIfAuthenticated")
const registerNewClient = require("../middlewares/registerNewClient")

const staticRouter = Router()

const allowedService = [
  { name: "feedwee", follow: "https://feedwee.herokuapp.com" }
]

staticRouter.get("/", (req, res) => {
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

staticRouter.get("/robots.txt", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "public", "robots.txt"))
})

staticRouter.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("login")
})

staticRouter.get("/signup", redirectIfAuthenticated, (req, res) => {
  res.render("signup")
})

staticRouter.get("/404", (req, res) => {
  res.render("404")
})

staticRouter.use(login.ensureLoggedIn())
staticRouter
  .route("/client/register")
  .get(async (req, res) => {
    try {
      const clients = await Client.findByOwner(req.user._id)
      return res.render("client/register", {
        clients
      })
    } catch (err) {
      throw err
    }
  })
  .post(registerNewClient(), (req, res) => {
    res.redirect("back")
  })

staticRouter.get("/dialog", (req, res) => {
  const { service, follow } = req.query
  if (!service || !follow) {
    return res.redirect("/")
  }
  const didMatch = allowedService.some((serviceDetails) => {
    return (
      serviceDetails.name.toLowerCase() === service.toLowerCase() &&
      serviceDetails.follow.toLowerCase() === follow.toLowerCase()
    )
  })
  if (didMatch) {
    return res.render("dialog")
  }
  return res.redirect("/404")
})

module.exports = staticRouter
