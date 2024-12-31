const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    schoolId: { type: String, required: true },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // List of subjects in the class
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
