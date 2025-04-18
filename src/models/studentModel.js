import mongoose from "mongoose"

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: String,
      required: [true, "Please add a student ID"],
      unique: true,
      trim: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    address: {
      type: String,
    },
    parentName: {
      type: String,
    },
    parentPhone: {
      type: String,
    },
    parentEmail: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
    },
    status: {
      type: String,
      enum: ["Active", "Graduated", "Transferred"],
      default: "Active",
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for parents
studentSchema.virtual("parents", {
  ref: "Parent",
  localField: "_id",
  foreignField: "children",
  justOne: false,
})

const Student = mongoose.model("Student", studentSchema)

export default Student
