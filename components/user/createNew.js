const isEmail = require("validator/lib/isEmail");

function createNew(data) {
  return new Promise(async (resolve, reject) => {
    const User = this;
    const { username, password, email } = data;
    if (!username || !password || !email) {
      return reject();
    }

    let user;
    try {
      if (isEmail(username)) {
        user = await User.findOne({ email: username });
      } else {
        user = await User.findOne({ username });
      }
    } catch (err) {
      return reject();
    }

    if (user != null) {
      return reject()
    }

    user = await User.create({ username, password, email });
    resolve(user);
  });
}

module.exports = createNew;
