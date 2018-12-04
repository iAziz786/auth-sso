const { Router } = require("express")

const router = Router()

const staticRouter = require("./staticRouter")
const authRouter = require("./authRouter")
const oauthRouter = require("./oauthRouter")
const apiRouter = require("./apiRouter")

router.use(oauthRouter)
router.use(authRouter)
router.use(staticRouter)
router.use("/api", apiRouter)

module.exports = router
