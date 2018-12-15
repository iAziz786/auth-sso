const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const { User } = require("../components/user/model")

const localStrategy = new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findByUsername(username)
    if (typeof user !== "object" && user == null) {
      return done(null, false)
    }
    if (!(await user.comparePassword(password))) {
      return done(null, false)
    }
    done(null, user.toJSON())
  } catch (err) {
    done(err)
  }
})

passport.use(localStrategy)
passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await User.findById(userId).then((user) => {
      if (user) {
        return user.toJSON()
      }
    })
    if (typeof user === "object" && user != null) {
      return done(null, user)
    }
    done(null, false)
  } catch (err) {
    done(err)
  }
})

exports.localStrategy = localStrategy
