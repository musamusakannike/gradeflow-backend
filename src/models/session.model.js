const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    year: { type: String, required: true }, // e.g., "2023/2024"
    terms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Term" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
