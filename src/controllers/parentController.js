import Parent from "../models/parentModel.js"
import User from "../models/userModel.js"
import Student from "../models/studentModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"

// @desc    Get all parents for a school
// @route   GET /api/parents/school/:schoolId
// @access  Private/SchoolAdmin
export const getParentsBySchool = asyncHandler(async (req, res, next) => {
  const parents = await Parent.find({ school: req.params.schoolId })
    .populate("user", "firstName lastName email phoneNumber")
    .populate({
      path: "children",
      select: "studentId",
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    })

  res.status(200).json({
    success: true,
    count: parents.length,
    data: parents,
  })
})

// @desc    Get single parent
// @route   GET /api/parents/:id
// @access  Private/SchoolAdmin/Parent
export const getParent = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findById(req.params.id)
    .populate("user", "firstName lastName email phoneNumber")
    .populate({
      path: "children",
      select: "studentId class",
      populate: [
        {
          path: "user",
          select: "firstName lastName",
        },
        {
          path: "class",
          select: "name",
        },
      ],
    })

  if (!parent) {
    return next(new AppError(`Parent not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school or is the parent
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN &&
    req.user.school.toString() !== parent.school.toString() &&
    req.user._id.toString() !== parent.user.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this parent`, 403))
  }

  res.status(200).json({
    success: true,
    data: parent,
  })
})

// @desc    Create new parent
// @route   POST /api/parents
// @access  Private/SchoolAdmin
export const createParent = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    children,
    occupation,
    address,
    alternatePhone,
    relationship,
  } = req.body

  // Check if user already exists
  const userExists = await User.findOne({ email })

  if (userExists) {
    return next(new AppError("User already exists", 400))
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role: ROLES.PARENT,
    school: req.user.school,
  })

  // Validate children
  if (children && children.length > 0) {
    for (const childId of children) {
      const student = await Student.findById(childId)
      if (!student) {
        await User.findByIdAndDelete(user._id)
        return next(new AppError(`Student not found with id of ${childId}`, 404))
      }

      if (student.school.toString() !== req.user.school.toString()) {
        await User.findByIdAndDelete(user._id)
        return next(new AppError(`Student ${childId} does not belong to this school`, 400))
      }
    }
  }

  // Create parent
  const parent = await Parent.create({
    user: user._id,
    children: children || [],
    occupation,
    address,
    alternatePhone,
    relationship,
    school: req.user.school,
  })

  res.status(201).json({
    success: true,
    data: parent,
  })
})

// @desc    Update parent
// @route   PUT /api/parents/:id
// @access  Private/SchoolAdmin
export const updateParent = asyncHandler(async (req, res, next) => {
  let parent = await Parent.findById(req.params.id)

  if (!parent) {
    return next(new AppError(`Parent not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN &&
    req.user.school.toString() !== parent.school.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this parent`, 403))
  }

  // Update user details if provided
  if (req.body.firstName || req.body.lastName || req.body.email || req.body.phoneNumber) {
    await User.findByIdAndUpdate(parent.user, {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    })
  }

  // Validate children if provided
  if (req.body.children && req.body.children.length > 0) {
    for (const childId of req.body.children) {
      const student = await Student.findById(childId)
      if (!student) {
        return next(new AppError(`Student not found with id of ${childId}`, 404))
      }

      if (student.school.toString() !== parent.school.toString()) {
        return next(new AppError(`Student ${childId} does not belong to this school`, 400))
      }
    }
  }

  // Remove user fields from req.body
  const { firstName, lastName, email, password, phoneNumber, ...parentData } = req.body

  parent = await Parent.findByIdAndUpdate(req.params.id, parentData, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: parent,
  })
})

// @desc    Delete parent
// @route   DELETE /api/parents/:id
// @access  Private/SchoolAdmin
export const deleteParent = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findById(req.params.id)

  if (!parent) {
    return next(new AppError(`Parent not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN &&
    req.user.school.toString() !== parent.school.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to delete this parent`, 403))
  }

  // Delete user
  await User.findByIdAndDelete(parent.user)

  // Delete parent
  await parent.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Add child to parent
// @route   PUT /api/parents/:id/add-child/:studentId
// @access  Private/SchoolAdmin
export const addChildToParent = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findById(req.params.id)
  const student = await Student.findById(req.params.studentId)

  if (!parent) {
    return next(new AppError(`Parent not found with id of ${req.params.id}`, 404))
  }

  if (!student) {
    return next(new AppError(`Student not found with id of ${req.params.studentId}`, 404))
  }

  // Make sure user belongs to school
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN &&
    req.user.school.toString() !== parent.school.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this parent`, 403))
  }

  // Make sure student belongs to the same school
  if (student.school.toString() !== parent.school.toString()) {
    return next(new AppError(`Student does not belong to the same school as parent`, 400))
  }

  // Check if student is already a child of this parent
  if (parent.children.includes(student._id)) {
    return next(new AppError(`Student is already a child of this parent`, 400))
  }

  // Add child to parent
  parent.children.push(student._id)
  await parent.save()

  res.status(200).json({
    success: true,
    data: parent,
  })
})

// @desc    Remove child from parent
// @route   PUT /api/parents/:id/remove-child/:studentId
// @access  Private/SchoolAdmin
export const removeChildFromParent = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findById(req.params.id)
  const student = await Student.findById(req.params.studentId)

  if (!parent) {
    return next(new AppError(`Parent not found with id of ${req.params.id}`, 404))
  }

  if (!student) {
    return next(new AppError(`Student not found with id of ${req.params.studentId}`, 404))
  }

  // Make sure user belongs to school
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN &&
    req.user.school.toString() !== parent.school.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this parent`, 403))
  }

  // Check if student is a child of this parent
  if (!parent.children.includes(student._id)) {
    return next(new AppError(`Student is not a child of this parent`, 400))
  }

  // Remove child from parent
  parent.children = parent.children.filter((childId) => childId.toString() !== student._id.toString())
  await parent.save()

  res.status(200).json({
    success: true,
    data: parent,
  })
})

// @desc    Get parent's children
// @route   GET /api/parents/:id/children
// @access  Private/SchoolAdmin/Parent
export const getParentChildren = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findById(req.params.id)

  if (!parent) {
    return next(new AppError(`Parent not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school or is the parent
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN &&
    req.user.school.toString() !== parent.school.toString() &&
    req.user._id.toString() !== parent.user.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this parent's children`, 403))
  }

  const children = await Student.find({ _id: { $in: parent.children } })
    .populate("user", "firstName lastName")
    .populate("class", "name")

  res.status(200).json({
    success: true,
    count: children.length,
    data: children,
  })
})

// @desc    Get parent by user ID
// @route   GET /api/parents/user/:userId
// @access  Private/SchoolAdmin/Parent
export const getParentByUser = asyncHandler(async (req, res, next) => {
  const parent = await Parent.findOne({ user: req.params.userId })
    .populate("user", "firstName lastName email phoneNumber")
    .populate({
      path: "children",
      select: "studentId class",
      populate: [
        {
          path: "user",
          select: "firstName lastName",
        },
        {
          path: "class",
          select: "name",
        },
      ],
    })

  if (!parent) {
    return next(new AppError(`Parent not found with user id of ${req.params.userId}`, 404))
  }

  // Make sure user belongs to school or is the parent
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN &&
    req.user.school.toString() !== parent.school.toString() &&
    req.user._id.toString() !== parent.user.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this parent`, 403))
  }

  res.status(200).json({
    success: true,
    data: parent,
  })
})
