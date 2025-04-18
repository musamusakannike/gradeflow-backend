import mongoose from "mongoose"

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a class name"],
      trim: true,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    academicSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicSession",
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

const Class = mongoose.model("Class", classSchema)

export default Class
