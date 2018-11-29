const http = require("http")
const chalk = require("chalk").default

process.on("unhandledRejection", (reason) => {
  console.error(reason)
  process.exit(1)
})

const app = require("./app")

const server = http.createServer(app)

server.listen(app.get("port"), () => {
  console.log(
    chalk.green(`App is running on port http://localhost:${app.get("port")}`)
  )
})

module.exports = server
