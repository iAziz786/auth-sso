const { Router } = require("express")
const passport = require("passport")
const { User } = require("../components/user/model")

const authRouter = Router()

authRouter.post(
  "/login",
  passport.authenticate("local", { successReturnToOrRedirect: true })
)

// authRouter.post("/client/register", (req, res) => {})

authRouter.post("/signup", async (req, res) => {
  const { email, password, username } = req.body
  if (!email || !password || !username) {
    return res.status(422).json({
      error: true,
      message: "parameter missing"
    })
  }

  try {
    const user = await User.createNew({
      email: { value: email },
      username,
      password
    })
    if (user == null) {
      return res.status(409).json({
        error: true,
        message: "user already exists with details"
      })
    }
    req.login(user, (err) => {
      if (err) throw err
      res.redirect("back")
    })
  } catch (err) {
    throw err
  }
})

authRouter.get("/logout", (req, res) => {
  req.logout()
  req.session = null
  res.redirect("back")
})

module.exports = authRouter
