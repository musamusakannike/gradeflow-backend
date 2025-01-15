import mongoose, { Schema, Document, Model } from "mongoose";

// Define an interface for the Term document
export interface ITerm extends Document {
  name: string;
  sessionId: mongoose.Types.ObjectId; // Reference to Session
  isScoringEnabled: boolean;
}

// Define the schema
const termSchema: Schema<ITerm> = new Schema(
  {
    name: { type: String, required: true },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    isScoringEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Export the model
const Term: Model<ITerm> = mongoose.model<ITerm>("Term", termSchema);
export default Term;
