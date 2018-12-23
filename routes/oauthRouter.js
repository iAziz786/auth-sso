const { Router } = require("express")
const ms = require("ms")
const jwt = require("jsonwebtoken")

const oauthServer = require("../middlewares/oauthServer")
const { Client } = require("../components/client/model")
const { Code } = require("../components/code/model")
const mathRedirectUri = require("../utils/matchRedirectUri")
const generateToken = require("../utils/generateToken")

const oauthRouter = Router()

oauthRouter.get(
  "/oauth/authorize",
  oauthServer.authorization,
  async (req, res) => {
    const { client_id, redirect_uri, state } = req.query
    const loggedInUserId = req.user._id

    try {
      const client = await Client.findById(client_id)
      if (client == null) {
        return res.render("error", {
          title: "Client not found",
          message: `Client with id = ${client_id} has not been found`
        })
      }
      // TODO: make redirectUrl to plural (redirectUrls)
      if (mathRedirectUri(client.redirectUri, redirect_uri)) {
        const code = generateToken()

        await Code.create({
          _id: code,
          expiresAt: Date.now() + ms("1 hour"),
          grants: ["profile"],
          user: loggedInUserId
        })
        return res.redirect(
          `${redirect_uri}?code=${code}&state=${encodeURIComponent(state)}`
        )
      }

      return res.render("error", {
        title: "Redirect URI Mismatch",
        message: `${redirect_uri} did not match any of the registered URIs`
      })
    } catch (err) {
      return res.render("error", {
        title: "Something went wrong",
        message: "We faced an unexpected error. We're working on that"
      })
    }
  }
  // },
  // (req, res) => {
  //   const { redirect_uri, state } = req.query
  //   res.redirect(`${redirect_uri}?code=${code[0].value}&state=${state}`)
  // }
)
oauthRouter.post("/oauth/token", async (req, res, next) => {
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
      email: "test@email.com",
      email_verified: true,
      preferred_username: "aziz"
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
