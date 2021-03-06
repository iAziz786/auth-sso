const path = require("path")
const express = require("express")
// const cors = require("cors")
const passport = require("passport")
// const cookieSession = require("cookie-session")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const ms = require("ms")
const bodyParser = require("body-parser")
const logger = require("morgan")
const dotenv = require("dotenv")
const MongoStore = require("connect-mongo")(session)

dotenv.config({ path: path.resolve(__dirname, "../.env") })

const router = require("../routes")
const app = express()
const publicPath = path.join(__dirname, "../public")
const { mainConnection } = require("../config/mongoose.config")

app.set("port", process.env.PORT || 3000)
app.set("views", "./views")
app.set("view engine", "pug")

// app.use(function(req, res, next) {
//     res.setHeader("Content-Security-Policy", "default-src 'self' feedwee.herokuapp.com");
//     return next();
// });

require("../services/passport")

app.use(cookieParser())
// app.use(
//   cookieSession({
//     name: "session",
//     keys: [process.env.COOKIE_SECRET],
//     maxAge: ms("30 days")
//   })
// )
// Below code can be use to handle session with a database call, also
// uncomment respective variables (e.g. mainConnection, session)
app.use(
  session({
    name: "SID",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: ms("30 days") },
    store: new MongoStore({ mongooseConnection: mainConnection })
  })
)
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
