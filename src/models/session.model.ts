import mongoose, { Schema, Document, Model } from "mongoose";

// Define interface for session document
export interface ISession extends Document {
  year: string;
  terms: mongoose.Types.ObjectId[];
}

// Define session schema and model for sessions collection in MongoDB database

const sessionSchema: Schema<ISession> = new Schema(
  {
    year: { type: String, required: true }, // e.g., "2023/2024"
    terms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Term" }],
  },
  { timestamps: true }
);

const Session: Model<ISession> = mongoose.model<ISession>(
  "Session",
  sessionSchema
);
export default Session;
