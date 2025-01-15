import mongoose, { Schema, Document, Model } from "mongoose";

// Define an interface for the class document
export interface IClass extends Document {
  name: string;
  schoolId: string;
  teacher: mongoose.Types.ObjectId; // Reference to a Teacher
  subjects: mongoose.Types.ObjectId[]; // Array of references to Subjects
}

// Define the schema
const classSchema: Schema<IClass> = new Schema(
  {
    name: { type: String, required: true },
    schoolId: { type: String, required: true },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher", // Reference to the "Teacher" model
      required: true,
    },
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject", // References to the "Subject" model
      },
    ],
  },
  { timestamps: true }
);

// Export the model
const Class: Model<IClass> = mongoose.model<IClass>("Class", classSchema);
export default Class;
