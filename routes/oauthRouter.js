const { Router } = require("express")

const oauthServer = require("../middlewares/oauthServer")
const { Client } = require("../components/client/modal")
const mathRedirectUri = require("../utils/matchRedirectUri")
const generateToken = require("../utils/generateToken")

const oauthRouter = Router()

oauthRouter.get(
  "/oauth/authorize",
  oauthServer.authorization,
  async (req, res) => {
    const { client_id, redirect_uri } = req.query
    console.log(client_id)
    try {
      const client = await Client.findById(client_id)
      console.log({ client })
      // if (mathRedirectUri(client, redirect_uri)) {
      const code = generateToken()
      return res.redirect(`${redirect_uri}?code${code}`)
      // }
      return res.render("404")
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
oauthRouter.post("/oauth/token", (req, res) => {
  res.status(200).json({ token: generateToken() })
})

module.exports = oauthRouter
