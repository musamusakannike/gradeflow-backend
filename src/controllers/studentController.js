import Student from "../models/studentModel.js"
import User from "../models/userModel.js"
import Parent from "../models/parentModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"

// @desc    Get all students for a school
// @route   GET /api/students/school/:schoolId
// @access  Private/SchoolAdmin
export const getStudentsBySchool = asyncHandler(async (req, res, next) => {
  const students = await Student.find({ school: req.params.schoolId })
    .populate("user", "firstName lastName email")
    .populate("class", "name")

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  })
})

// @desc    Get all students for a class
// @route   GET /api/students/class/:classId
// @access  Private/SchoolAdmin/ClassTeacher
export const getStudentsByClass = asyncHandler(async (req, res, next) => {
  const students = await Student.find({ class: req.params.classId })
    .populate("user", "firstName lastName email")
    .populate("class", "name")

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  })
})

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private/SchoolAdmin/ClassTeacher/Student
export const getStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id)
    .populate("user", "firstName lastName email")
    .populate("class", "name")

  if (!student) {
    return next(new AppError(`Student not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school or is the student
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.school.toString() !== student.school.toString() &&
    req.user._id.toString() !== student.user.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this student`, 403))
  }

  res.status(200).json({
    success: true,
    data: student,
  })
})

// @desc    Create new student
// @route   POST /api/students
// @access  Private/SchoolAdmin
export const createStudent = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    class: classId,
    dateOfBirth,
    gender,
    address,
    parentName,
    parentPhone,
    parentEmail,
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
    role: ROLES.STUDENT,
    school: req.user.school,
  })

  // Generate student ID
  const schoolCode = req.user.school.toString().substring(0, 3).toUpperCase()
  const year = new Date().getFullYear().toString().substring(2)
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const studentId = `${schoolCode}/${year}/${randomNum}`

  // Create student
  const student = await Student.create({
    user: user._id,
    studentId,
    class: classId,
    dateOfBirth,
    gender,
    address,
    parentName,
    parentPhone,
    parentEmail,
    school: req.user.school,
  })

  res.status(201).json({
    success: true,
    data: student,
  })
})

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/SchoolAdmin
export const updateStudent = asyncHandler(async (req, res, next) => {
  let student = await Student.findById(req.params.id)

  if (!student) {
    return next(new AppError(`Student not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== student.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this student`, 403))
  }

  // Update user details if provided
  if (req.body.firstName || req.body.lastName || req.body.email) {
    await User.findByIdAndUpdate(student.user, {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    })
  }

  // Remove user fields from req.body
  const { firstName, lastName, email, password, ...studentData } = req.body

  student = await Student.findByIdAndUpdate(req.params.id, studentData, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: student,
  })
})

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/SchoolAdmin
export const deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id)

  if (!student) {
    return next(new AppError(`Student not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== student.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to delete this student`, 403))
  }

  // Delete user
  await User.findByIdAndDelete(student.user)

  // Delete student
  await student.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Update student status
// @route   PUT /api/students/:id/status
// @access  Private/SchoolAdmin
export const updateStudentStatus = asyncHandler(async (req, res, next) => {
  let student = await Student.findById(req.params.id)

  if (!student) {
    return next(new AppError(`Student not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== student.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this student`, 403))
  }

  // Update student status
  student = await Student.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    {
      new: true,
      runValidators: true,
    },
  )

  res.status(200).json({
    success: true,
    data: student,
  })
})

// @desc    Get student's parents
// @route   GET /api/students/:id/parents
// @access  Private/SchoolAdmin/Student
export const getStudentParents = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id)

  if (!student) {
    return next(new AppError(`Student not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school or is the student
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SUPER_SUPER_ADMIN &&
    req.user.school.toString() !== student.school.toString() &&
    req.user._id.toString() !== student.user.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this student's parents`, 403))
  }

  const parents = await Parent.find({ children: student._id }).populate("user", "firstName lastName email phoneNumber")

  res.status(200).json({
    success: true,
    count: parents.length,
    data: parents,
  })
})
