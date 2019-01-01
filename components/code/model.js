const { Schema } = require("mongoose")
const { mainConnection } = require("../../config/mongoose.config")

const { ObjectId } = Schema.Types

const CodeSchema = new Schema(
  {
    _id: {
      type: String,
      required: true
    },

    expiresAt: {
      type: Date
    },

    scope: {
      type: [String],
      enum: ["openid", "profile", "email", "address", "phone", "offline_access"]
    },

    user: {
      type: ObjectId,
      ref: "User"
    },

    issuedToClient: {
      type: ObjectId,
      ref: "Client"
    },

    nonce: {
      type: String
    }
  },
  { timestamps: true }
)

CodeSchema.methods.hasExpired = require("./hasExpired")

const Code = mainConnection.model("Code", CodeSchema)
exports.Code = Code
