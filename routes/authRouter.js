const { Router } = require("express")
const { User } = require("../components/user/model")

const passportLocalLogin = require("../middlewares/passportLocalLogin")

const authRouter = Router()

authRouter.post("/login", passportLocalLogin, (req, res) => {
  const { returnTo = "/" } = req.session || {}
  return res.redirect(returnTo)
})

// authRouter.post("/client/register", (req, res) => {})

authRouter.post("/signup", async (req, res) => {
  const { email, password, username, name } = req.body
  if (!email || !password || !username || !name) {
    return res.status(422).json({
      error: true,
      message: "parameter missing"
    })
  }

  try {
    const user = await User.createNew({
      email: { value: email },
      username,
      password,
      name
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
  req.session.destroy((err) => {
    if (err) throw err
    res.redirect("back")
  })
})

module.exports = authRouter
