const { Client } = require("../components/client/model")
const createPassword = require("../utils/createPassword")

function registerNewClient() {
  return async (req, res, next) => {
    const {
      body: { name, redirectUri },
      query: { projectId }
    } = req
    try {
      const client = await Client.create({
        clientSecret: createPassword(48),
        ownerId: req.user._id,
        name,
        projectId,
        redirectUri: [redirectUri]
      })
      req.client = client
      next()
    } catch (err) {
      next(err)
    }
  }
}

module.exports = registerNewClient
