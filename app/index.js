const path = require("path")
const express = require("express")
const cors = require("cors")
const passport = require("passport")
const bodyParser = require("body-parser")
const logger = require("morgan")
const dotenv = require("dotenv")

const { User } = require("../components/user/model");

dotenv.config({ path: path.resolve(__dirname, "../.env") })

const router = require("../routes")
const app = express()
const publicPath = path.join(__dirname, "../public")

app.set("port", process.env.PORT)

// app.use(function(req, res, next) {
//     res.setHeader("Content-Security-Policy", "default-src 'self' feedwee.herokuapp.com");
//     return next();
// });

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (username, done) => {
  try {
    const user = await User.findByUsername(username);
    if (typeof user === "object" && user != null) {
      done(null, user);
    }
  } catch (err) {
    done(err); 
  }
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(require("cookie-parser")())
app.use(passport.initialize())
app.use(passport.session())
app.use(cors())
app.use(logger("dev"))
app.use(express.static(publicPath))

app.use("/", router)

module.exports = app
