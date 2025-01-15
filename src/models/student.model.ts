import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

// Define an interface for the Student document
export interface IStudent extends Document {
  fullName: string;
  studentId: string;
  schoolId: string;
  email?: string; // Email is optional
  password: string;
  classId: mongoose.Types.ObjectId; // Reference to Class
  isPasswordMatch(candidatePassword: string): Promise<boolean>;
}

// Define the schema
const studentSchema: Schema<IStudent> = new Schema(
  {
    fullName: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    schoolId: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class", // Reference to the Class model
      required: true,
    },
  },
  { timestamps: true }
);

// Middleware: Hash password before saving
studentSchema.pre<IStudent>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Add a method to compare passwords
studentSchema.methods.isPasswordMatch = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
const Student: Model<IStudent> = mongoose.model<IStudent>("Student", studentSchema);
export default Student;
