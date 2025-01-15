import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

// Define an interface for the Teacher document
export interface ITeacher extends Document {
  fullName: string;
  teacherId: string;
  schoolId: string;
  email: string;
  password: string;
  isPasswordMatch(candidatePassword: string): Promise<boolean>;
}

// Define the schema
const teacherSchema: Schema<ITeacher> = new Schema(
  {
    fullName: { type: String, required: true },
    teacherId: { type: String, required: true, unique: true },
    schoolId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Middleware: Hash the password before saving
teacherSchema.pre<ITeacher>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Add a method to compare passwords
teacherSchema.methods.isPasswordMatch = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
const Teacher: Model<ITeacher> = mongoose.model<ITeacher>("Teacher", teacherSchema);
export default Teacher;
