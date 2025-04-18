import mongoose from "mongoose"

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a subject name"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Please add a subject code"],
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    allowStudentAddition: {
      type: Boolean,
      default: true,
    },
    obtainableScores: {
      test1: {
        type: Number,
        default: 100,
      },
      test2: {
        type: Number,
        default: 100,
      },
      exam: {
        type: Number,
        default: 100,
      },
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

const Subject = mongoose.model("Subject", subjectSchema)

export default Subject
