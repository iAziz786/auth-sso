const LocalStrategy = require("passport-local").Strategy
const { User } = require("../components/user/model")

const localStrategy = new LocalStrategy(async (username, password, done) => {
  let user
  try {
    user = await User.findByUsername(username)
    if (typeof user !== "object" && user == null) {
      return done(null, false)
    }
    if (!await user.comparePassword(password)) {
      return done(null, false)
    }
    done(null, user.toJSON())
  } catch (err) {
    done(err)
  }
})

exports.localStrategy = localStrategy
