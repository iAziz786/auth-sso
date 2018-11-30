const { Client } = require("../components/client/modal")
const createPassword = require("../utils/createPassword")

function registerNewClient() {
  return async (req, res, next) => {
    const {
      Types: { ObjectId }
    } = require("mongoose")
    try {
      await Client.create({
        clientId: ObjectId(),
        clientSecret: createPassword(48),
        ownerId: req.user._id
      })
      next()
    } catch (err) {
      next(err)
    }
  }
}

module.exports = registerNewClient
