import mongoose from "mongoose"

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    term: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Term",
      required: true,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    position: {
      type: Number,
    },
    numberOfSubjects: {
      type: Number,
      default: 0,
    },
    classTeacherRemark: {
      type: String,
    },
    principalRemark: {
      type: String,
    },
    isPublished: {
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

const Result = mongoose.model("Result", resultSchema)

export default Result
