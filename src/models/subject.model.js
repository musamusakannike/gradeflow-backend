const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // List of enrolled students
    allowStudentAddition: { type: Boolean, default: true }, // Allows students to join
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
