const { Schema } = require("mongoose")
const { mainConnection } = require("../../config/mongoose.config")

const TokenSchema = new Schema({
  value: {
    type: String
  },
  nonce: {
    type: String
  },
  scope: {
    type: String
  }
})

const Token = mainConnection.model("Token", TokenSchema)
exports.Token = Token
