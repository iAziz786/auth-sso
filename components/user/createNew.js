function createNew(data) {
  return new Promise(async (resolve, reject) => {
    const User = this
    const { username, password, email } = data
    if (!username || !password || !email) {
      return reject()
    }

    let user = await User.findByUsername(username)

    if (user != null) {
      return reject()
    }

    user = await User.create({ username, password, email })
    resolve(user)
  })
}

module.exports = createNew
