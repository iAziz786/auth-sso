const bcrypt = require("bcryptjs");

function comparePassword(candidatePassword) {
  return new Promise(async (resolve, reject) => {
    const user = this;
    try {
      resolve(await bcrypt.compare(candidatePassword, user.password));
    } catch (err) {
      reject(false);
    }
  });
}

module.exports = comparePassword;
