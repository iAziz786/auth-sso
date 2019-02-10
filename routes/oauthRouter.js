const { Router } = require("express")
const cors = require("cors")
const ms = require("ms")
const jwt = require("jsonwebtoken")

const ensureLoggedIn = require("../middlewares/ensureLoggedIn")
const promptUserConsent = require("../middlewares/promptUserConsent")
const { Client } = require("../components/client/model")
const { Code } = require("../components/code/model")
const { Token } = require("../components/token/model")
const mathRedirectUri = require("../utils/matchRedirectUri")
const generateToken = require("../utils/generateToken")

const oauthRouter = Router()

oauthRouter.get("/oauth/authorize", ensureLoggedIn, promptUserConsent)

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
            info.phone_number = user.phoneNumber && user.phoneNumber.value
            info.phone_number_verified =
              user.phoneNumber && user.phoneNumber.isVerified
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

oauthRouter
  .route("/oauth/consent")
  .get(async (req, res) => {
    const { client_id, scope = "" } = req.session.oauth2
    const client = await Client.findById(client_id)
    const scopes = scope
      .split(" ")
      .filter(Boolean)
      .filter((scope) => scope !== "openid")
    if (typeof client === "object" && client != null) {
      return res.render("consent", {
        client_name: client.name,
        scopes
      })
    } else {
      return res.render("error", {
        title: "Client not found",
        message: `Client with id = ${client_id} has not been found`
      })
    }
  })
  .post(async (req, res) => {
    const { consent } = req.body
    const {
      client_id,
      redirect_uri,
      state,
      nonce,
      scope = ""
    } = req.session.oauth2
    if (consent === "allow") {
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
    } else {
      return res.redirect(
        `${redirect_uri}?error=access_denied&state=${encodeURIComponent(state)}`
      )
    }
  })

oauthRouter.route("/oauth/jwks.json").get((req, res) => {
  return res.status(200).json({
    keys: [
      {
        alg: "RS256",
        kty: "RSA",
        use: "sig",
        x5c: [
          "MIIDDTCCAfWgAwIBAgIJAJVkuSv2H8mDMA0GCSqGSIb3DQEBBQUAMB0xGzAZBgNVBAMMEnNhbmRyaW5vLmF1dGgwLmNvbTAeFw0xNDA1MTQyMTIyMjZaFw0yODAxMjEyMTIyMjZaMB0xGzAZBgNVBAMMEnNhbmRyaW5vLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL6jWASkHhXz5Ug6t5BsYBrXDIgrWu05f3oq2fE+5J5REKJiY0Ddc+Kda34ZwOptnUoef3JwKPDAckTJQDugweNNZPwOmFMRKj4xqEpxEkIX8C+zHs41Q6x54ZZy0xU+WvTGcdjzyZTZ/h0iOYisswFQT/s6750tZG0BOBtZ5qS/80tmWH7xFitgewdWteJaASE/eO1qMtdNsp9fxOtN5U/pZDUyFm3YRfOcODzVqp3wOz+dcKb7cdZN11EYGZOkjEekpcedzHCo9H4aOmdKCpytqL/9FXoihcBMg39s1OW3cfwfgf5/kvOJdcqR4PoATQTfsDVoeMWVB4XLGR6SC5kCAwEAAaNQME4wHQYDVR0OBBYEFHDYn9BQdup1CoeoFi0Rmf5xn/W9MB8GA1UdIwQYMBaAFHDYn9BQdup1CoeoFi0Rmf5xn/W9MAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBAGLpQZdd2ICVnGjc6CYfT3VNoujKYWk7E0shGaCXFXptrZ8yaryfo6WAizTfgOpQNJH+Jz+QsCjvkRt6PBSYX/hb5OUDU2zNJN48/VOw57nzWdjI70H2Ar4oJLck36xkIRs/+QX+mSNCjZboRwh0LxanXeALHSbCgJkbzWbjVnfJEQUP9P/7NGf0MkO5I95C/Pz9g91y8gU+R3imGppLy9Zx+OwADFwKAEJak4JrNgcjHBQenakAXnXP6HG4hHH4MzO8LnLiKv8ZkKVL67da/80PcpO0miMNPaqBBMd2Cy6GzQYE0ag6k0nk+DMIFn7K+o21gjUuOEJqIbAvhbf2KcM="
        ],
        n:
          "vqNYBKQeFfPlSDq3kGxgGtcMiCta7Tl_eirZ8T7knlEQomJjQN1z4p1rfhnA6m2dSh5_cnAo8MByRMlAO6DB401k_A6YUxEqPjGoSnESQhfwL7MezjVDrHnhlnLTFT5a9MZx2PPJlNn-HSI5iKyzAVBP-zrvnS1kbQE4G1nmpL_zS2ZYfvEWK2B7B1a14loBIT947Woy102yn1_E603lT-lkNTIWbdhF85w4PNWqnfA7P51wpvtx1k3XURgZk6SMR6Slx53McKj0fho6Z0oKnK2ov_0VeiKFwEyDf2zU5bdx_B-B_n-S84l1ypHg-gBNBN-wNWh4xZUHhcsZHpILmQ",
        e: "AQAB",
        kid: "RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg",
        x5t: "RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg"
      }
    ]
  })
})

module.exports = oauthRouter
