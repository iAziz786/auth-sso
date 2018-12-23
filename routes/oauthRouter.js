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
  try {
    const { client_id, client_secret, code: authorizationCode } = req.body
    const client = await Client.findById(client_id)

    if (!client.didSecretMatch(client_secret)) {
      return res.status(401).json({
        error: true,
        message: "client_secret did not matched"
      })
    }

    const code = await Code.findById(authorizationCode).populate("user")

    if (!code) {
      return res.status(401).json({
        error: true,
        message: "incorrect authorization code"
      })
    }

    if (code.hasExpired()) {
      return res.status(401).json({
        error: true,
        message: "authorization code has been expired"
      })
    }
    const { user } = code
    jwt.sign(
      {
        iss: process.env.AUTH_SERVER,
        sub: "sioafjiasdfiosf",
        aud: client_id,
        iat: Date.now(),
        name: user.name,
        family_name: user.name,
        birthday: user.birthday,
        email: user.email.value,
        email_verified: user.email.isVerified,
        preferred_username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "1 hour" },
      (err, id_token) => {
        if (err) throw next(err)
        return res.status(200).json({
          id_token,
          access_token: generateToken(),
          refresh_token: generateToken()
        })
      }
    )
  } catch (err) {
    return res.status(417).json({
      error: true,
      message: "Some error happend"
    })
  }
})

module.exports = oauthRouter
