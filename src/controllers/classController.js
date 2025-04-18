import Class from "../models/classModel.js"
import User from "../models/userModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"

// @desc    Get all classes for a school
// @route   GET /api/classes/:schoolId
// @access  Private/SchoolAdmin
export const getClasses = asyncHandler(async (req, res, next) => {
  const classes = await Class.find({ school: req.params.schoolId })
    .populate("classTeacher", "firstName lastName email")
    .populate("academicSession", "name")

  res.status(200).json({
    success: true,
    count: classes.length,
    data: classes,
  })
})

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private/SchoolAdmin
export const getClass = asyncHandler(async (req, res, next) => {
  const cls = await Class.findById(req.params.id)
    .populate("classTeacher", "firstName lastName email")
    .populate("academicSession", "name")

  if (!cls) {
    return next(new AppError(`Class not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== cls.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this class`, 403))
  }

  res.status(200).json({
    success: true,
    data: cls,
  })
})

// @desc    Create new class
// @route   POST /api/classes
// @access  Private/SchoolAdmin
export const createClass = asyncHandler(async (req, res, next) => {
  // Add school to req.body
  req.body.school = req.user.school

  // Check if class teacher exists and is a teacher
  if (req.body.classTeacher) {
    const teacher = await User.findById(req.body.classTeacher)

    if (!teacher) {
      return next(new AppError(`Teacher not found with id of ${req.body.classTeacher}`, 404))
    }

    if (teacher.role !== ROLES.TEACHER && teacher.role !== ROLES.CLASS_TEACHER) {
      return next(new AppError(`User ${req.body.classTeacher} is not a teacher`, 400))
    }

    // Update teacher role to class teacher
    await User.findByIdAndUpdate(req.body.classTeacher, { role: ROLES.CLASS_TEACHER })
  }

  const cls = await Class.create(req.body)

  res.status(201).json({
    success: true,
    data: cls,
  })
})

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/SchoolAdmin
export const updateClass = asyncHandler(async (req, res, next) => {
  let cls = await Class.findById(req.params.id)

  if (!cls) {
    return next(new AppError(`Class not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== cls.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this class`, 403))
  }

  // Check if class teacher exists and is a teacher
  if (req.body.classTeacher) {
    const teacher = await User.findById(req.body.classTeacher)

    if (!teacher) {
      return next(new AppError(`Teacher not found with id of ${req.body.classTeacher}`, 404))
    }

    if (teacher.role !== ROLES.TEACHER && teacher.role !== ROLES.CLASS_TEACHER) {
      return next(new AppError(`User ${req.body.classTeacher} is not a teacher`, 400))
    }

    // Update teacher role to class teacher
    await User.findByIdAndUpdate(req.body.classTeacher, { role: ROLES.CLASS_TEACHER })
  }

  cls = await Class.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: cls,
  })
})

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/SchoolAdmin
export const deleteClass = asyncHandler(async (req, res, next) => {
  const cls = await Class.findById(req.params.id)

  if (!cls) {
    return next(new AppError(`Class not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== cls.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to delete this class`, 403))
  }

  await cls.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})
