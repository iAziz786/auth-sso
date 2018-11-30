async function findByOwner(ownerId) {
  try {
    const Client = this
    const clients = await Client.find({ ownerId })
    return clients
  } catch (err) {
    throw err
  }
}

module.exports = findByOwner
