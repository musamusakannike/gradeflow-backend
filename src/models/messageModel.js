import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        fileName: String,
        fileType: String,
        fileUrl: String,
      },
    ],
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
messageSchema.index({ conversationId: 1, createdAt: -1 })
messageSchema.index({ sender: 1, recipient: 1 })
messageSchema.index({ recipient: 1, read: 1 })

const Message = mongoose.model("Message", messageSchema)

export default Message
