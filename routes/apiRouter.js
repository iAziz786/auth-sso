const _ = require("lodash")
const isEmail = require("validator/lib/isEmail")
const { Router } = require("express")

const { User } = require("../components/user/model")

const apiRouter = Router()

apiRouter.get("/data", (req, res) => {
  res.json({
    message: "Hello!"
  })
})

apiRouter.post("/signup", async (req, res) => {
  const { email, password, username } = req.body
  if (!email || !password || !username) {
    return res.status(422).json({
      error: true,
      message: "parameter missing"
    })
  }

  let user
  try {
    user = await User.createNew({ email, username, password })
  } catch (err) {}
  if (user == null) {
    return res.status(409).json({
      error: true,
      message: "user already exists with details"
    })
  }

  res.json({ success: true, user: _.omit(user.toJSON(), ["password"]) })
})

apiRouter.route("/login").post(async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(403).json({
      error: true,
      message: "username or password not provided"
    })
  }

  let user
  if (isEmail(username)) {
    user = await User.findOne({ email: username })
  } else {
    user = await User.findOne({ username })
  }

  if (user == null) {
    return res.status(404).json({
      error: true,
      message: "user not found"
    })
  }

  const authenticated = await user.comparePassword(password)
  if (authenticated) {
    return res.json({
      success: true,
      name: user.name
    })
  }

  return res.status(401).json({
    error: true,
    message: "authentication failed"
  })
})

module.exports = apiRouter
