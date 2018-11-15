const { Schema } = require("mongoose");

const comparePassword = require("./comparePassword");
const createNew = require("./createNew");
const preSave = require("./preSave");
const { mainConnection } = require("../../config/mongoose.config");

const UserSchema = new Schema({
  name: {
    type: String
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  username: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  }
});

UserSchema.statics.createNew = createNew; 

UserSchema.pre("save", preSave);

UserSchema.methods.comparePassword = comparePassword; 

const User = mainConnection.model("User", UserSchema);
exports.User = User;
