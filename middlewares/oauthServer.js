const login = require("connect-ensure-login")
const oauth2orize = require("oauth2orize")
const oauth2orize_oidc = require("oauth2orize-openid")

const { Client } = require("../components/client/model")

const server = oauth2orize.createServer()

server.serializeClient(function(clientId, done) {
  return done(null, clientId)
})

server.deserializeClient(function(id, done) {
  Client.findById(id)
    .then((client) => {
      done(null, client)
    })
    .catch((err) => {
      done(err)
    })
})

server.grant(
  oauth2orize.grant.code(function(_client, _redirectURI, _user, _ares, done) {
    var code = "iasdoifisodjfio"

    // db.authorizationCodes.save(code, client.id, redirectURI, user.id, function(
    //   err
    // ) {
    //   if (err) {
    //     return done(err)
    //   }
    done(null, code)
    // })
  })
)

server.grant(
  oauth2orize_oidc.grant.codeIDToken(
    (client, redirect_uri, user, done) => {
      console.log(client, redirect_uri, user)
      const code = "siodfiosadjgoiasdjfasdf"
      done(null, code)
    },
    (_client, _user, _req, done) => {
      const id_token = null
      done(null, id_token)
    }
  )
)

server.exchange(
  oauth2orize.exchange.code(function(_client, _code, _redirectURI, done) {
    // db.authorizationCodes.find(code, function(err, authCode) {
    //   if (err) {
    //     return done(err)
    //   }
    //   if (client.id !== authCode.clientID) {
    //     return done(null, false)
    //   }
    //   if (redirectURI !== authCode.redirectURI) {
    //     return done(null, false)
    //   }

    //   var token = utils.uid(256)
    //   db.accessTokens.save(token, authCode.userID, authCode.clientID, function(
    //     err
    //   ) {
    //     if (err) {
    //       return done(err)
    //     }
    //     done(null, token)
    //   })
    // })
    done(null, "aosidjfoisadjiofasdiof")
  })
)

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
