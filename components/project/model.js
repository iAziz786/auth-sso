const { Schema } = require("mongoose")
const { ObjectId } = Schema.Types

const { mainConnection } = require("../../config/mongoose.config")
const findByOwner = require("./findByOwner")

const ProjectSchema = new Schema(
  {
    name: {
      type: String
    },

    ownerId: {
      type: ObjectId,
      ref: "User",
      required: true
    },

    clients: {
      type: [{ type: ObjectId, ref: "Client" }]
    }
  },
  { timestamps: true }
)

ProjectSchema.statics.findByOwner = findByOwner

const Project = mainConnection.model("Project", ProjectSchema)
exports.Project = Project
