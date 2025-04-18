import mongoose from "mongoose"

const parentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    occupation: {
      type: String,
    },
    address: {
      type: String,
    },
    alternatePhone: {
      type: String,
    },
    relationship: {
      type: String,
      enum: ["Father", "Mother", "Guardian", "Other"],
      default: "Guardian",
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Parent = mongoose.model("Parent", parentSchema)

export default Parent
