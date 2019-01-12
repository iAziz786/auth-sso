const { Schema, Types } = require("mongoose")
const { mainConnection } = require("../../config/mongoose.config")
const { ObjectId } = Types

const TokenSchema = new Schema(
  {
    value: {
      type: String
    },

    scope: {
      type: [String],
      enum: [
        "openid",
        "profile",
        "email",
        "address",
        "phone",
        "offline_access"
      ],
      default: undefined
    },

    expiresAt: {
      type: Date
    },

    userAgreedTo: {
      type: ObjectId,
      ref: "User"
    },

    associatedAuthorizationCode: {
      type: String
    },

    associatedAccessToken: {
      type: String
    },

    tokenType: {
      type: String,
      enum: ["access", "refresh"]
    }
  },
  { timestamps: true }
)

const Token = mainConnection.model("Token", TokenSchema)
exports.Token = Token
