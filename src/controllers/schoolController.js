import School from "../models/schoolModel.js"
import User from "../models/userModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"

// @desc    Get all schools
// @route   GET /api/schools
// @access  Private/SuperAdmin
export const getSchools = asyncHandler(async (req, res, next) => {
  const schools = await School.find().populate("admin", "firstName lastName email")

  res.status(200).json({
    success: true,
    count: schools.length,
    data: schools,
  })
})

// @desc    Get single school
// @route   GET /api/schools/:id
// @access  Private/SuperAdmin/SchoolAdmin
export const getSchool = asyncHandler(async (req, res, next) => {
  const school = await School.findById(req.params.id).populate("admin", "firstName lastName email")

  if (!school) {
    return next(new AppError(`School not found with id of ${req.params.id}`, 404))
  }

  // Make sure user is school admin or super admin
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    (req.user.role !== ROLES.SCHOOL_ADMIN || req.user.school.toString() !== school._id.toString())
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this school`, 403))
  }

  res.status(200).json({
    success: true,
    data: school,
  })
})

// @desc    Create new school
// @route   POST /api/schools
// @access  Private/SuperAdmin
export const createSchool = asyncHandler(async (req, res, next) => {
  const {
    name,
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
  } = req.body

  // Check if school already exists
  const schoolExists = await School.findOne({ name })

  if (schoolExists) {
    return next(new AppError("School already exists", 400))
  }

  // Check if admin already exists
  const adminExists = await User.findOne({ email: adminEmail })

  if (adminExists) {
    return next(new AppError("Admin already exists", 400))
  }

  // Create school
  const school = await School.create({
    name,
    address,
    city,
    state,
    country,
    phoneNumber,
    email,
    website,
  })

  // Create school admin
  const admin = await User.create({
    firstName: adminFirstName,
    lastName: adminLastName,
    email: adminEmail,
    password: adminPassword,
    role: ROLES.SCHOOL_ADMIN,
    school: school._id,
  })

  // Update school with admin
  school.admin = admin._id
  await school.save()

  res.status(201).json({
    success: true,
    data: school,
  })
})

// @desc    Update school
// @route   PUT /api/schools/:id
// @access  Private/SuperAdmin/SchoolAdmin
export const updateSchool = asyncHandler(async (req, res, next) => {
  let school = await School.findById(req.params.id)

  if (!school) {
    return next(new AppError(`School not found with id of ${req.params.id}`, 404))
  }

  // Make sure user is school admin or super admin
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    (req.user.role !== ROLES.SCHOOL_ADMIN || req.user.school.toString() !== school._id.toString())
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this school`, 403))
  }

  // Merge existing data with updates
  const updateFields = {
    name: req.body.name || school.name,
    address: req.body.address || school.address,
    city: req.body.city || school.city,
    state: req.body.state || school.state,
    country: req.body.country || school.country,
    phoneNumber: req.body.phoneNumber || school.phoneNumber,
    email: req.body.email || school.email,
    website: req.body.website || school.website,
    logo: req.body.logo !== undefined ? req.body.logo : school.logo
  }

  school = await School.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: school,
  })
})

// @desc    Delete school
// @route   DELETE /api/schools/:id
// @access  Private/SuperAdmin
export const deleteSchool = asyncHandler(async (req, res, next) => {
  const school = await School.findById(req.params.id)

  if (!school) {
    return next(new AppError(`School not found with id of ${req.params.id}`, 404))
  }

  await School.deleteOne({ _id: school._id })

  res.status(200).json({
    success: true,
    data: {},
  })
})
