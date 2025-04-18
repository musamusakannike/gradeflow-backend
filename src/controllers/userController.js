import User from "../models/userModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin/SchoolAdmin
export const getUsers = asyncHandler(async (req, res, next) => {
  let query

  // If super admin, get all users
  if (req.user.role === ROLES.SUPER_ADMIN) {
    query = User.find()
  } else {
    // If school admin, get users from their school
    query = User.find({ school: req.user.school })
  }

  const users = await query

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  })
})

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/SuperAdmin/SchoolAdmin
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new AppError(`User not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && user.school.toString() !== req.user.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this user`, 403))
  }

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Create user
// @route   POST /api/users
// @access  Private/SuperAdmin/SchoolAdmin
export const createUser = asyncHandler(async (req, res, next) => {
  // If school admin, add school to req.body
  if (req.user.role === ROLES.SCHOOL_ADMIN) {
    req.body.school = req.user.school
  }

  const user = await User.create(req.body)

  res.status(201).json({
    success: true,
    data: user,
  })
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/SuperAdmin/SchoolAdmin
export const updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id)

  if (!user) {
    return next(new AppError(`User not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && user.school.toString() !== req.user.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this user`, 403))
  }

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin/SchoolAdmin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new AppError(`User not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && user.school.toString() !== req.user.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to delete this user`, 403))
  }

  await user.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})
