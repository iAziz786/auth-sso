function getRandom(min, max) {
  if (typeof max === "undefined") {
    max = min
    min = 0
  }
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) - min
}

function createPassword(size = 32) {
  const lowerCase = "abcdefghijklmnopqrstuvwxyz"
  const upperCase = lowerCase.toUpperCase()
  const number = "0123456789"
  const urlSafeChar = "$-_.+!*'(),"

  const all = lowerCase + number + upperCase + urlSafeChar

  let result = ""
  for (let i = 0; i < size; i++) {
    const randomIndex = getRandom(all.length)
    result += all.charAt(randomIndex)
  }
  return result
}

module.exports = createPassword
