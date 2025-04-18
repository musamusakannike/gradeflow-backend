import mongoose from "mongoose"

const termSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a term name"],
      enum: ["First Term", "Second Term", "Third Term"],
      trim: true,
    },
    academicSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicSession",
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, "Please add a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please add an end date"],
    },
    allowScoring: {
      type: Boolean,
      default: false,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const Term = mongoose.model("Term", termSchema)

export default Term
