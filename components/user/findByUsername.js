const isEmail = require("validator/lib/isEmail")

async function findByUsername(username) {
  const User = this
  if (typeof username !== "string" || !username) {
    return null
  }

  let user
  if (isEmail(username)) {
    user = await User.findOne({ email: username })
  } else {
    user = await User.findOne({ username })
  }

  return user
}

module.exports = findByUsername
