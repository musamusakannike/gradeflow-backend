import mongoose from "mongoose"

const academicSessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a session name"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Please add a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please add an end date"],
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

const AcademicSession = mongoose.model("AcademicSession", academicSessionSchema)

export default AcademicSession
