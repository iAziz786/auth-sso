const { omit } = require("lodash")
const { Router } = require("express")

const { User } = require("../components/user/model")
const passportLocalLogin = require("../middlewares/passportLocalLogin");

const apiRouter = Router()

apiRouter.get("/test", (req, res) => {
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

  res.json({ success: true, user: omit(user.toJSON(), ["password"]) })
})

apiRouter
  .route("/login")
  .post(passportLocalLogin, async (req, res) => {

  if (req.isAuthenticated()) {
    return res.json({
      success: true,
      user: omit(req.user, ["password"]) 
    })
  }
  // Ideally, route wouldn't hit this return but just to be safe sending this
  return res.status(401).json({
    error: true,
    message: "authentication failed"
  })
})

module.exports = apiRouter
