const login = require("connect-ensure-login")

exports.authorization = [
  login.ensureLoggedIn()
  // server.authorization(async (clientId, redirectUri, done) => {
  //   try {
  //     await Client.findById(clientId)
  //     done(null, clientId, redirectUri)
  //   } catch (err) {
  //     done(err)
  //   }
  // })
]
