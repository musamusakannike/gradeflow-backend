import mongoose from "mongoose"

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    subject: {
      type: String,
      default: "No subject",
    },
    isArchived: {
      type: Boolean,
      default: false,
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

// Create indexes for faster queries
conversationSchema.index({ participants: 1 })
conversationSchema.index({ updatedAt: -1 })

const Conversation = mongoose.model("Conversation", conversationSchema)

export default Conversation
