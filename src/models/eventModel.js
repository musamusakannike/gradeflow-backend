import mongoose from "mongoose"

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add an event title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add an event description"],
    },
    startDate: {
      type: Date,
      required: [true, "Please add a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please add an end date"],
    },
    location: {
      type: String,
    },
    eventType: {
      type: String,
      enum: ["holiday", "exam", "meeting", "activity", "other"],
      default: "other",
    },
    targetAudience: {
      type: [String],
      enum: ["all", "teachers", "students", "parents", "staff"],
      default: ["all"],
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

const Event = mongoose.model("Event", eventSchema)

export default Event
