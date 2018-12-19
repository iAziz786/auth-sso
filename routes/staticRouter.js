const path = require("path")
const { Router } = require("express")
const login = require("connect-ensure-login")

const { Client } = require("../components/client/model")
const { Project } = require("../components/project/model")
const redirectIfAuthenticated = require("../middlewares/redirectIfAuthenticated")
const registerNewClient = require("../middlewares/registerNewClient")

const staticRouter = Router()

const allowedService = [
  { name: "feedwee", follow: "https://feedwee.herokuapp.com" }
]

staticRouter.get("/", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const { name, username, email } = req.user
    return res.render("dashboard/index", {
      name,
      username,
      email: email.value
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

// Only let users access the urls below if they are authenticated
staticRouter.use(login.ensureLoggedIn())

staticRouter.route("/project/all").get(async (req, res) => {
  const {
    user: { _id: userId }
  } = req
  try {
    const projects = await Project.findByOwner(userId)
    return res.render("project/list", {
      projects
    })
  } catch (err) {
    throw err
  }
})

staticRouter
  .route("/project/new")
  .get(async (req, res) => {
    res.render("project/new")
  })
  .post(async (req, res) => {
    const {
      user: { _id: userId },
      body: { name }
    } = req
    try {
      await Project.create({
        name,
        ownerId: userId
      })
      res.redirect("/project/all")
    } catch (err) {
      throw err
    }
  })

staticRouter.route("/project").get(async (req, res) => {
  const {
    query: { projectId }
  } = req
  const [project, clients] = await Promise.all([
    Project.findById(projectId),
    Client.find({ projectId })
      .select("-clientSecret")
      .select("-redirectUri")
  ])
  return res.render("project/details", {
    project,
    clients: clients.length ? clients : []
  })
})

staticRouter
  .route("/oauthclient")
  .get(async (req, res) => {
    const {
      query: { projectId }
    } = req
    const project = await Project.findById(projectId)
    return res.render("client/register", { project })
  })
  .post((req, res) => {
    const {
      query: { projectId }
    } = req
  })

staticRouter.route("/oauthclient/:clientId").get(async (req, res) => {
  const {
    params: { clientId }
  } = req
  try {
    const client = await Client.findById(clientId)
    res.render("client/details", {
      client: client ? client : {}
    })
  } catch (err) {
    throw err
  }
})

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
    res.redirect(`/oauthclient/${req.client._id}`)
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
