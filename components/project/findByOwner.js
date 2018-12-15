async function findByOwner(ownerId) {
  try {
    const Project = this
    const projects = await Project.find({ ownerId })
    return projects
  } catch (err) {
    throw err
  }
}

module.exports = findByOwner
