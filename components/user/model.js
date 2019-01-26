const { Schema } = require("mongoose")

const comparePassword = require("./comparePassword")
const createNew = require("./createNew")
const preSave = require("./preSave")
const findByUsername = require("./findByUsername")
const { mainConnection } = require("../../config/mongoose.config")

const emailSchema = new Schema(
  {
    value: {
      type: String,
      unique: true,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
)

const phoneSchema = new Schema(
  {
    value: {
      type: String,
      default: ""
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
)

const addressSchema = new Schema({
  formatted: {
    type: String
  },

  streetAddress: {
    type: String
  },

  locality: {
    type: String
  },

  region: {
    type: String
  },

  postalCode: {
    type: String
  },

  country: {
    type: String
  }
})

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    givenName: {
      type: String
    },

    familyName: {
      type: String
    },

    nickname: {
      type: String
    },

    profile: {
      type: String
    },

    picture: {
      type: String
    },

    website: {
      type: String
    },

    gender: {
      type: String,
      enum: ["female", "male", "transgender", "other"]
    },

    birthdate: {
      type: Date
    },

    zoneinfo: {
      type: String
    },

    locale: {
      type: String
    },

    phoneNumber: {
      type: phoneSchema,
      unique: false,
      default: phoneSchema
    },

    address: addressSchema,

    email: emailSchema,

    username: {
      type: String,
      unique: true,
      required: true
    },

    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

UserSchema.statics.createNew = createNew
UserSchema.statics.findByUsername = findByUsername

UserSchema.pre("save", preSave)

UserSchema.methods.comparePassword = comparePassword

const User = mainConnection.model("User", UserSchema)
exports.User = User
