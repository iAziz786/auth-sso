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

    grants: {
      type: [String],
      enum: ["profile"]
    },

    user: {
      type: ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
)

CodeSchema.methods.hasExpired = require("./hasExpired")

const Code = mainConnection.model("Code", CodeSchema)
exports.Code = Code
