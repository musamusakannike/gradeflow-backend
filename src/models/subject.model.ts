import mongoose, { Schema, Document, Model } from "mongoose";

// Define an interface for the Subject document
export interface ISubject extends Document {
  name: string;
  classId: mongoose.Types.ObjectId; // Reference to Class
  teacherId: mongoose.Types.ObjectId; // Reference to Teacher
  students: mongoose.Types.ObjectId[]; // Array of references to Students
  allowStudentAddition: boolean;
}

// Define the schema
const subjectSchema: Schema<ISubject> = new Schema(
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
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    allowStudentAddition: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Export the model
const Subject: Model<ISubject> = mongoose.model<ISubject>("Subject", subjectSchema);
export default Subject;
