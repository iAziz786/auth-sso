const { Router } = require("express")
const { User } = require('../components/user/model')
const passport = require("passport")

const authRouter = Router()

authRouter.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/"
  })
)

authRouter.post("/signup", async (req, res) => {
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
  req.login(user, (err) => {
    if (err) throw err
    res.redirect("back")
  })
})

authRouter.get('/logout', (req, res) => {
  req.logout()
  req.session = null
  res.redirect('back');
})

module.exports = authRouter
