const mongoose = require("mongoose");

const termSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Term 1"
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    isScoringEnabled: { type: Boolean, default: false }, // Enables or disables scoring
  },
  { timestamps: true }
);

module.exports = mongoose.model("Term", termSchema);
