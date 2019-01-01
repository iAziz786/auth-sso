const { Router } = require("express")
const ms = require("ms")
const jwt = require("jsonwebtoken")

const ensureLoggedIn = require("../middlewares/ensureLoggedIn")
const { Client } = require("../components/client/model")
const { Code } = require("../components/code/model")
const mathRedirectUri = require("../utils/matchRedirectUri")
const generateToken = require("../utils/generateToken")

const oauthRouter = Router()

oauthRouter.get("/oauth/authorize", ensureLoggedIn, async (req, res) => {
  const { client_id, redirect_uri, state, nonce, scope } = req.query
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
        // A maximum authorization code lifetime of 10 minutes is RECOMMENDED.
        // https://tools.ietf.org/html/rfc6749#section-4.1.2
        expiresAt: Date.now() + ms("10 minutes"),
        scope: scope.split(" "),
        user: loggedInUserId,
        issuedToClient: client_id,
        nonce
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
})

oauthRouter.post("/oauth/token", async (req, res, next) => {
  try {
    const { client_id, client_secret, code: authorizationCode } = req.body
    const client = await Client.findById(client_id)

    if (!client.didSecretMatch(client_secret)) {
      return res.status(401).json({
        error: "invalid_client",
        message: "client_secret did not matched"
      })
    }

    const code = await Code.findById(authorizationCode).populate("user")

    if (!code) {
      return res.status(401).json({
        error: "invalid_client",
        error_description: "incorrect authorization code"
      })
    }

    if (String(code.issuedToClient) !== client_id) {
      return res.status(401).json({
        error: "invalid_grant",
        error_description: "authorization code was not issued to this client"
      })
    }

    if (code.hasExpired()) {
      return res.status(401).json({
        error: "invalid_grant",
        error_description: "authorization code has been expired"
      })
    }
    const { user, nonce } = code
    const expiresAge = "1 hour"
    jwt.sign(
      {
        iss: process.env.AUTH_SERVER,
        sub: "sioafjiasdfiosf",
        aud: client_id,
        iat: Date.now(),
        name: user.name,
        nonce,
        family_name: user.name,
        birthday: user.birthday,
        email: user.email.value,
        email_verified: user.email.isVerified,
        preferred_username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: expiresAge },
      (err, id_token) => {
        if (err) throw next(err)
        // According to the specification all token responses that contains tokens,
        // secrets, or other sensitive information MUST include the following headers
        // fields and values
        res.setHeader("Cache-Control", "no-store")
        res.setHeader("Pragma", "no-cache")
        return res.status(200).json({
          id_token,
          token_type: "Bearer",
          expires_in: ms(expiresAge) / 1000,
          access_token: generateToken(),
          refresh_token: generateToken()
        })
      }
    )
  } catch (err) {
    throw new Error(err)
  }
})

module.exports = oauthRouter
