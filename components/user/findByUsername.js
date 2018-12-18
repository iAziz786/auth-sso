const isEmail = require("validator/lib/isEmail")

async function findByUsername(username) {
  const User = this
  if (typeof username !== "string" || !username) {
    return null
  }

  let user
  try {
    if (isEmail(username)) {
      user = await User.findOne({ "email.value": username })
    } else {
      user = await User.findOne({ username })
    }
    return user
  } catch (err) {
    throw err
  }
}

module.exports = findByUsername
