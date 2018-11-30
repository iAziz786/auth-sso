const {
  Schema,
  Types: { ObjectId }
} = require("mongoose")

const { mainConnection } = require("../../config/mongoose.config")
const findByOwner = require("./findByOwner")

const ClientSchema = new Schema({
  name: {
    type: String
  },

  ownerId: {
    type: ObjectId,
    ref: "User",
    required: true
  },

  clientId: {
    type: String,
    unique: true,
    required: true
  },

  clientSecret: {
    type: String,
    required: true
  },

  redirectUri: [
    {
      type: String
    }
  ]
})

ClientSchema.statics.findByOwner = findByOwner

const Client = mainConnection.model("Client", ClientSchema)
exports.Client = Client
