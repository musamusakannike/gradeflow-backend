import mongoose, {Schema, Document, Model} from "mongoose";

// Define interface for school document
export interface ISchool extends Document {
  name: string;
  address: string;
  schoolId: string;
  admin: mongoose.Types.ObjectId;
}

const schoolSchema: Schema <ISchool> = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    schoolId: { type: String, required: true, unique: true },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

const School: Model <ISchool> = mongoose.model <ISchool>("School", schoolSchema);
export default School;