const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
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

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Admin", adminSchema);
