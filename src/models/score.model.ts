import mongoose, { Schema, Document, Model } from "mongoose";

// Define interface for score document
export interface IScore extends Document {
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  termId: mongoose.Types.ObjectId;
  test1: number;
  test2: number;
  exam: number;
}

const scoreSchema: Schema<IScore> = new Schema(
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

const Score: Model<IScore> = mongoose.model<IScore>("Score", scoreSchema);
export default Score;
