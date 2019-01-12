const { Router } = require("express")
const cors = require("cors")
const ms = require("ms")
const jwt = require("jsonwebtoken")

const ensureLoggedIn = require("../middlewares/ensureLoggedIn")
const { Client } = require("../components/client/model")
const { Code } = require("../components/code/model")
const { Token } = require("../components/token/model")
const mathRedirectUri = require("../utils/matchRedirectUri")
const generateToken = require("../utils/generateToken")

const oauthRouter = Router()

oauthRouter.get("/oauth/authorize", ensureLoggedIn, async (req, res) => {
  const { client_id, redirect_uri, state, nonce, scope = "" } = req.query
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
      const authorizationCode = generateToken()
      const accessToken = generateToken()
      const refreshToken = generateToken()
      const allScopes = scope.split(" ").filter(Boolean)

      await Code.create({
        value: authorizationCode,
        // A maximum authorization code lifetime of 10 minutes is RECOMMENDED.
        // https://tools.ietf.org/html/rfc6749#section-4.1.2
        expiresAt: Date.now() + ms("10 minutes"),
        scope: allScopes,
        user: loggedInUserId,
        issuedToClient: client_id,
        nonce
      })

      await Token.create({
        value: accessToken,
        scope: allScopes,
        associatedAuthorizationCode: authorizationCode,
        userAgreedTo: loggedInUserId,
        expiresAt: Date.now() + ms("1 hour"),
        tokenType: "access"
      })

      await Token.create({
        value: refreshToken,
        scope: allScopes,
        associatedAuthorizationCode: authorizationCode,
        associatedAccessToken: accessToken,
        userAgreedTo: loggedInUserId,
        expiresAt: Date.now() + ms("1 hour"),
        tokenType: "refresh"
      })

      return res.redirect(
        `${redirect_uri}?code=${authorizationCode}&state=${encodeURIComponent(
          state
        )}`
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
    const { client_id, client_secret, code } = req.body
    const client = await Client.findById(client_id)

    if (!client.didSecretMatch(client_secret)) {
      return res.status(400).json({
        error: "invalid_client",
        message: "client_secret did not matched"
      })
    }

    const authorizationCode = await Code.findOne({ value: code }).populate(
      "user"
    )

    if (!authorizationCode) {
      return res.status(400).json({
        error: "invalid_client",
        error_description: "incorrect authorization code"
      })
    }

    if (String(authorizationCode.issuedToClient) !== client_id) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "authorization code was not issued to this client"
      })
    }

    if (authorizationCode.hasExpired()) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "authorization code has been expired"
      })
    }
    const { user, nonce } = authorizationCode
    const expiresAge = "1 hour"
    const accessToken = await Token.findOne({
      associatedAuthorizationCode: code,
      tokenType: "access"
    })
    const refreshToken = await Token.findOne({
      associatedAuthorizationCode: code,
      tokenType: "refresh"
    })
    jwt.sign(
      {
        iss: process.env.AUTH_SERVER,
        sub: user._id,
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
          access_token: accessToken.value,
          refresh_token: refreshToken.value
        })
      }
    )
  } catch (err) {
    throw new Error(err)
  }
})

oauthRouter.route("/oauth/userinfo").get(cors(), async (req, res) => {
  const parts = req.headers && req.headers.authorization.split(" ")
  if (parts.length === 2) {
    const schema = parts[0]
    const credentials = parts[1]
    if (/^Bearer$/.test(schema)) {
      const token = credentials
      const authToken = await Token.findOne({ value: token }).populate(
        "userAgreedTo"
      )
      const { userAgreedTo: user } = authToken
      const info = {}
      ;(authToken.scope || []).forEach((scopeType) => {
        switch (scopeType) {
          case "openid":
            info.sub = authToken.userAgreedToToken
            break
          case "profile":
            info.name = user.name
            info.family_name = user.family_name
            info.given_name = user.given_name
            info.middle_name = user.middle_name
            info.nickname = user.nickname
            info.preferred_username = user.preferred_username
            info.profile = user.profile
            info.picture = user.picture
            info.website = user.website
            info.gender = user.gender
            info.birthdate = user.birthdate
            info.zoneinfo = user.zoneinfo
            info.locale = user.locale
            info.updated_at = user.updatedAt
            break
          case "email":
            info.email = user.email.value
            info.email_verified = user.email.isVerified
            break
          case "address":
            info.address = user.address
            break
          case "phone":
            info.phone_number = user.phoneNumber.value
            info.phone_number_verified = user.phoneNumber.isVerified
            break
        }
      })
      return res.status(200).json(info)
    } else {
      return res
        .status(400)
        .setHeader(
          "WWW-Authenticate",
          'Bearer error="invalid_request" error_description="Authorization request MUST be sent as a Bearer Token"'
        )
        .send()
    }
  } else {
    return res
      .status(400)
      .setHeader(
        "WWW-Authenticate",
        'Bearer error="invalid_request" error_description="Request header should contain Authorizaiton field"'
      )
      .send()
  }
})

module.exports = oauthRouter
