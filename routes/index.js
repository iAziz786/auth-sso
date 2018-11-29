const { Router } = require("express")

const router = Router()

const staticRouter = require("./staticRouter")
const authRouter = require("./authRouter")
const apiRouter = require("./apiRouter")

router.use(authRouter)
router.use(staticRouter)
router.use("/api", apiRouter)

module.exports = router
