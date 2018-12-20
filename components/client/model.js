const { Schema } = require("mongoose")

const { ObjectId } = Schema.Types

const { mainConnection } = require("../../config/mongoose.config")
const findByOwner = require("./findByOwner")

const ClientSchema = new Schema({
  name: {
    type: String,
    required: true
  },

  ownerId: {
    type: ObjectId,
    ref: "User",
    required: true
  },

  projectId: {
    type: ObjectId,
    ref: "Project",
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
