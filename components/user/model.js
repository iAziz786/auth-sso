const { Schema } = require('mongoose');
const { mainConnection } = require('../../config/mongoose.config');

const UserSchema = new Schema({
  name: {
    type: String
  },

  email: {
    type: String,
    required: true
  },

  username: {
    type: String,
  },

  password: {
    type: String,
    required: true
  }
})

const User = mainConnection.model('User', UserSchema);
exports.User = User;
