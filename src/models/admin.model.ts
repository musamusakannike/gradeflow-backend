import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

// Define an interface for the Admin document
export interface IAdmin extends Document {
  fullName: string;
  schoolName: string;
  adminEmail: string;
  schoolEmail: string;
  schoolAddress: string;
  password: string;
  schoolId: string;
  createdAt?: Date;
  updatedAt?: Date;
  isPasswordMatch(candidatePassword: string): Promise<boolean>;
}

// Define the schema
const adminSchema: Schema<IAdmin> = new Schema(
  {
    fullName: { type: String, required: true },
    schoolName: { type: String, required: true },
    adminEmail: { type: String, required: true, unique: true },
    schoolEmail: { type: String, required: true, unique: true },
    schoolAddress: { type: String, required: true },
    password: { type: String, required: true },
    schoolId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Middleware: Hash password before saving
adminSchema.pre<IAdmin>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Add a method to compare passwords
adminSchema.methods.isPasswordMatch = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
const Admin: Model<IAdmin> = mongoose.model<IAdmin>("Admin", adminSchema);
export default Admin;
