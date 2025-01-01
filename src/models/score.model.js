const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    termId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Term",
      required: true,
    },
    test1: { type: Number, default: 0 },
    test2: { type: Number, default: 0 },
    exam: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Score", scoreSchema);
