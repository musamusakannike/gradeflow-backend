import mongoose from "mongoose"

const scoreSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    term: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Term",
      required: true,
    },
    test1: {
      type: Number,
      min: 0,
      default: 0,
    },
    test2: {
      type: Number,
      min: 0,
      default: 0,
    },
    exam: {
      type: Number,
      min: 0,
      default: 0,
    },
    percentageScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "E", "F"],
    },
    remark: {
      type: String,
    },
    teacher: {
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

// Calculate percentage score and grade before saving
scoreSchema.pre("save", async function (next) {
  try {
    // Get the subject to access obtainable scores
    const Subject = mongoose.model("Subject")
    const subject = await Subject.findById(this.subject)

    if (!subject) {
      throw new Error("Subject not found")
    }

    const obtainableTest1 = subject.obtainableScores.test1 || 100
    const obtainableTest2 = subject.obtainableScores.test2 || 100
    const obtainableExam = subject.obtainableScores.exam || 100

    // Calculate percentage for each component
    const test1Percentage = (this.test1 / obtainableTest1) * 100
    const test2Percentage = (this.test2 / obtainableTest2) * 100
    const examPercentage = (this.exam / obtainableExam) * 100

    // Calculate overall percentage (assuming equal weight)
    this.percentageScore = (test1Percentage + test2Percentage + examPercentage) / 3

    // Calculate grade
    if (this.percentageScore >= 70) {
      this.grade = "A"
      this.remark = "Excellent"
    } else if (this.percentageScore >= 60) {
      this.grade = "B"
      this.remark = "Very Good"
    } else if (this.percentageScore >= 50) {
      this.grade = "C"
      this.remark = "Good"
    } else if (this.percentageScore >= 45) {
      this.grade = "D"
      this.remark = "Fair"
    } else if (this.percentageScore >= 40) {
      this.grade = "E"
      this.remark = "Pass"
    } else {
      this.grade = "F"
      this.remark = "Fail"
    }

    next()
  } catch (error) {
    next(error)
  }
})

const Score = mongoose.model("Score", scoreSchema)

export default Score
