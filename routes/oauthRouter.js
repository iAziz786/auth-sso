const { Router } = require("express")
const jwt = require("jsonwebtoken")

const oauthServer = require("../middlewares/oauthServer")
const { Client } = require("../components/client/modal")
const mathRedirectUri = require("../utils/matchRedirectUri")
const generateToken = require("../utils/generateToken")

const oauthRouter = Router()

oauthRouter.get(
  "/oauth/authorize",
  oauthServer.authorization,
  async (req, res) => {
    const { client_id, redirect_uri, state } = req.query
    console.log(client_id)
    try {
      const client = await Client.findById(client_id)
      console.log({ client })
      // if (mathRedirectUri(client, redirect_uri)) {
      const code = generateToken()

      return res.redirect(
        `${redirect_uri}?code=${code}&state=${encodeURIComponent(state)}`
      )
      // }
    } catch (err) {
      return res.render("404")
    }
  }
  // },
  // (req, res) => {
  //   const { redirect_uri, state } = req.query
  //   res.redirect(`${redirect_uri}?code=${code[0].value}&state=${state}`)
  // }
)
oauthRouter.post("/oauth/token", (req, res, next) => {
  const { client_id } = req.body
  jwt.sign(
    {
      iss: process.env.AUTH_SERVER,
      sub: "sioafjiasdfiosf",
      aud: client_id,
      iat: Date.now(),
      name: "Aziz",
      family_name: "Mohammad",
      dob: "01-01-1991",
      email: "test@gmail.com",
      email_verified: true
    },
    process.env.JWT_SECRET,
    { expiresIn: "1 hour" },
    (err, id_token) => {
      if (err) throw next(err)
      res.status(200).json({
        id_token,
        access_token: generateToken(),
        refresh_token: generateToken()
      })
    }
  )
})

module.exports = oauthRouter
