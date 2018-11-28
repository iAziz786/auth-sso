const path = require("path")
const express = require("express")
// const cors = require("cors")
const passport = require("passport")
const cookieSession = require("cookie-session")
const cookieParser = require("cookie-parser")
const ms = require("ms")
const bodyParser = require("body-parser")
const logger = require("morgan")
const dotenv = require("dotenv")

const { User } = require("../components/user/model")

dotenv.config({ path: path.resolve(__dirname, "../.env") })

const router = require("../routes")
const app = express()
const publicPath = path.join(__dirname, "../public")

app.set("port", process.env.PORT)

// app.use(function(req, res, next) {
  //     res.setHeader("Content-Security-Policy", "default-src 'self' feedwee.herokuapp.com");
  //     return next();
  // });
  
  require("../services/passport")
  
  app.use(cookieParser())
  app.use(cookieSession({
    name: 'session',
    keys: ['talking to the moon'],
    maxAge: ms('30 days')
  }))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  // NOTE: Any middlware starts with express.(...) will be called before any
  // middlware which get called with passport.(...). Reason why it happens
  // is not found yet by me
  app.use(express.static(publicPath))
  app.use(passport.initialize())
  app.use(passport.session())
  // app.use(cors())
  app.use(logger("dev"))
  
  app.use("/", router)

module.exports = app
