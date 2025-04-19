import User from "../models/userModel.js";
import School from "../models/schoolModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import { sendPasswordResetEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { ROLES } from "../config/roles.js";

// @desc    Register super admin
// @route   POST /api/auth/register-super-admin
// @access  Public
export const registerSuperAdmin = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError("User already exists", 400));
  }

  // Create super admin
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: ROLES.SUPER_ADMIN,
  });

  if (user) {
    sendTokenResponse(user, 201, res);
  } else {
    return next(new AppError("Invalid user data", 400));
  }
});

// @desc    Register school and school admin
// @route   POST /api/auth/register-school
// @access  Public
export const registerSchool = asyncHandler(async (req, res, next) => {
  const {
    schoolName,
    address,
    city,
    state,
    country,
    phoneNumber,
    email,
    website,
    adminFirstName,
    adminLastName,
    adminEmail,
    adminPassword,
  } = req.body;

  // Check if school already exists
  const schoolExists = await School.findOne({ name: schoolName });

  if (schoolExists) {
    return next(new AppError("School already exists", 400));
  }

  // Check if admin already exists
  const adminExists = await User.findOne({ email: adminEmail });

  if (adminExists) {
    return next(new AppError("Admin already exists", 400));
  }

  // Create school
  const school = await School.create({
    name: schoolName,
    address,
    city,
    state,
    country,
    phoneNumber,
    email,
    website,
  });

  // Create school admin
  const admin = await User.create({
    firstName: adminFirstName,
    lastName: adminLastName,
    email: adminEmail,
    password: adminPassword,
    role: ROLES.SCHOOL_ADMIN,
    school: school._id,
  });

  // Update school with admin
  school.admin = admin._id;
  await school.save();

  sendTokenResponse(admin, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, phoneNumber } = req.body;

  const currentUser = await User.findById(req.user.id);

  if (!currentUser) {
    return next(new AppError("User not found", 404));
  }

  const fieldsToUpdate = {
    firstName: firstName || currentUser.firstName,
    lastName: lastName || currentUser.lastName,
    email: email || currentUser.email,
    phoneNumber: phoneNumber || currentUser.phoneNumber,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new AppError("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with that email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({ 
      success: true, 
      message: "Password reset email sent successfully" 
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError("Email could not be sent", 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  // Find user by token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      school: user.school,
    },
  });
};
