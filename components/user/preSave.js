const bcrypt = require("bcryptjs");

function preSave() {
  return new Promise(async (resolve, reject) => {
    const user = this;
    if (user.isModified("password")) {
      try {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        return resolve();
      } catch (err) {
        return reject(err);
      }
    }
    return resolve();
  });
}

module.exports = preSave;
