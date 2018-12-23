function createNew(data) {
  return new Promise(async (resolve, reject) => {
    const User = this
    const { username, password, email, name } = data
    if (!username || !password || !email || !name) {
      return reject()
    }

    let user = await User.findByUsername(username)

    if (user != null) {
      return reject()
    }

    user = await User.create({ username, password, email, name })
    resolve(user)
  })
}

module.exports = createNew
