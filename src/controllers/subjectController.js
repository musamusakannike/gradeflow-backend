import Subject from "../models/subjectModel.js"
import User from "../models/userModel.js"
import Student from "../models/studentModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"

// @desc    Get all subjects for a class
// @route   GET /api/subjects/class/:classId
// @access  Private/SchoolAdmin/Teacher
export const getSubjectsByClass = asyncHandler(async (req, res, next) => {
  const subjects = await Subject.find({ class: req.params.classId })
    .populate("teacher", "firstName lastName email")
    .populate("class", "name")

  res.status(200).json({
    success: true,
    count: subjects.length,
    data: subjects,
  })
})

// @desc    Get all subjects for a teacher
// @route   GET /api/subjects/teacher/:teacherId
// @access  Private/SchoolAdmin/Teacher
export const getSubjectsByTeacher = asyncHandler(async (req, res, next) => {
  const subjects = await Subject.find({ teacher: req.params.teacherId })
    .populate("teacher", "firstName lastName email")
    .populate("class", "name")

  res.status(200).json({
    success: true,
    count: subjects.length,
    data: subjects,
  })
})

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private/SchoolAdmin/Teacher
export const getSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findById(req.params.id)
    .populate("teacher", "firstName lastName email")
    .populate("class", "name")
    .populate({
      path: "students",
      select: "studentId",
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    })

  if (!subject) {
    return next(new AppError(`Subject not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== subject.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this subject`, 403))
  }

  res.status(200).json({
    success: true,
    data: subject,
  })
})

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private/SchoolAdmin
export const createSubject = asyncHandler(async (req, res, next) => {
  // Add school to req.body
  req.body.school = req.user.school

  // Check if teacher exists and is a teacher
  if (req.body.teacher) {
    const teacher = await User.findById(req.body.teacher)

    if (!teacher) {
      return next(new AppError(`Teacher not found with id of ${req.body.teacher}`, 404))
    }

    if (teacher.role !== ROLES.TEACHER && teacher.role !== ROLES.CLASS_TEACHER) {
      return next(new AppError(`User ${req.body.teacher} is not a teacher`, 400))
    }
  }

  const subject = await Subject.create(req.body)

  res.status(201).json({
    success: true,
    data: subject,
  })
})

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/SchoolAdmin
export const updateSubject = asyncHandler(async (req, res, next) => {
  let subject = await Subject.findById(req.params.id)

  if (!subject) {
    return next(new AppError(`Subject not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== subject.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this subject`, 403))
  }

  // Check if teacher exists and is a teacher
  if (req.body.teacher) {
    const teacher = await User.findById(req.body.teacher)

    if (!teacher) {
      return next(new AppError(`Teacher not found with id of ${req.body.teacher}`, 404))
    }

    if (teacher.role !== ROLES.TEACHER && teacher.role !== ROLES.CLASS_TEACHER) {
      return next(new AppError(`User ${req.body.teacher} is not a teacher`, 400))
    }
  }

  subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: subject,
  })
})

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/SchoolAdmin
export const deleteSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findById(req.params.id)

  if (!subject) {
    return next(new AppError(`Subject not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== subject.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to delete this subject`, 403))
  }

  await subject.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Toggle student addition permission
// @route   PUT /api/subjects/:id/toggle-student-addition
// @access  Private/Teacher
export const toggleStudentAddition = asyncHandler(async (req, res, next) => {
  let subject = await Subject.findById(req.params.id)

  if (!subject) {
    return next(new AppError(`Subject not found with id of ${req.params.id}`, 404))
  }

  // Make sure user is the teacher of this subject
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SCHOOL_ADMIN &&
    subject.teacher.toString() !== req.user._id.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this subject`, 403))
  }

  subject = await Subject.findByIdAndUpdate(
    req.params.id,
    { allowStudentAddition: !subject.allowStudentAddition },
    {
      new: true,
      runValidators: true,
    },
  )

  res.status(200).json({
    success: true,
    data: subject,
  })
})

// @desc    Update obtainable scores
// @route   PUT /api/subjects/:id/obtainable-scores
// @access  Private/Teacher
export const updateObtainableScores = asyncHandler(async (req, res, next) => {
  let subject = await Subject.findById(req.params.id)

  if (!subject) {
    return next(new AppError(`Subject not found with id of ${req.params.id}`, 404))
  }

  // Make sure user is the teacher of this subject
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SCHOOL_ADMIN &&
    subject.teacher.toString() !== req.user._id.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this subject`, 403))
  }

  subject = await Subject.findByIdAndUpdate(
    req.params.id,
    { obtainableScores: req.body.obtainableScores },
    {
      new: true,
      runValidators: true,
    },
  )

  res.status(200).json({
    success: true,
    data: subject,
  })
})

// @desc    Add student to subject
// @route   PUT /api/subjects/:id/add-student/:studentId
// @access  Private/Teacher/Student
export const addStudentToSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findById(req.params.id)
  const student = await Student.findById(req.params.studentId)

  if (!subject) {
    return next(new AppError(`Subject not found with id of ${req.params.id}`, 404))
  }

  if (!student) {
    return next(new AppError(`Student not found with id of ${req.params.studentId}`, 404))
  }

  // Check if student is already in the subject
  if (subject.students.includes(student._id)) {
    return next(new AppError(`Student is already registered for this subject`, 400))
  }

  // If user is a student, check if they are the student being added
  // and if the subject allows student addition
  if (req.user.role === ROLES.STUDENT) {
    if (student.user.toString() !== req.user._id.toString()) {
      return next(new AppError(`You can only register yourself for subjects`, 403))
    }

    if (!subject.allowStudentAddition) {
      return next(new AppError(`This subject is not open for student registration`, 403))
    }
  }
  // If user is not a student, check if they are the teacher of the subject
  else if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SCHOOL_ADMIN &&
    subject.teacher.toString() !== req.user._id.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this subject`, 403))
  }

  // Add student to subject
  subject.students.push(student._id)
  await subject.save()

  res.status(200).json({
    success: true,
    data: subject,
  })
})

// @desc    Remove student from subject
// @route   PUT /api/subjects/:id/remove-student/:studentId
// @access  Private/Teacher/Student
export const removeStudentFromSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findById(req.params.id)
  const student = await Student.findById(req.params.studentId)

  if (!subject) {
    return next(new AppError(`Subject not found with id of ${req.params.id}`, 404))
  }

  if (!student) {
    return next(new AppError(`Student not found with id of ${req.params.studentId}`, 404))
  }

  // Check if student is in the subject
  if (!subject.students.includes(student._id)) {
    return next(new AppError(`Student is not registered for this subject`, 400))
  }

  // If user is a student, check if they are the student being removed
  if (req.user.role === ROLES.STUDENT) {
    if (student.user.toString() !== req.user._id.toString()) {
      return next(new AppError(`You can only remove yourself from subjects`, 403))
    }
  }
  // If user is not a student, check if they are the teacher of the subject
  else if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.role !== ROLES.SCHOOL_ADMIN &&
    subject.teacher.toString() !== req.user._id.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this subject`, 403))
  }

  // Remove student from subject
  subject.students = subject.students.filter((studentId) => studentId.toString() !== student._id.toString())
  await subject.save()

  res.status(200).json({
    success: true,
    data: subject,
  })
})

// @desc    Get subjects for a student
// @route   GET /api/subjects/student/:studentId
// @access  Private/SchoolAdmin/Teacher/Student
export const getSubjectsByStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.studentId)

  if (!student) {
    return next(new AppError(`Student not found with id of ${req.params.studentId}`, 404))
  }

  // Make sure user belongs to school or is the student
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.school.toString() !== student.school.toString() &&
    req.user._id.toString() !== student.user.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this student's subjects`, 403))
  }

  const subjects = await Subject.find({ students: student._id })
    .populate("teacher", "firstName lastName email")
    .populate("class", "name")

  res.status(200).json({
    success: true,
    count: subjects.length,
    data: subjects,
  })
})

// @desc    Get available subjects for a student
// @route   GET /api/subjects/available/:studentId
// @access  Private/Student
export const getAvailableSubjects = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.studentId)

  if (!student) {
    return next(new AppError(`Student not found with id of ${req.params.studentId}`, 404))
  }

  // Make sure user is the student
  if (req.user.role === ROLES.STUDENT && req.user._id.toString() !== student.user.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this student's subjects`, 403))
  }

  // Get all subjects for the student's class that allow student addition
  // and that the student is not already registered for
  const subjects = await Subject.find({
    class: student.class,
    allowStudentAddition: true,
    students: { $ne: student._id },
  })
    .populate("teacher", "firstName lastName email")
    .populate("class", "name")

  res.status(200).json({
    success: true,
    count: subjects.length,
    data: subjects,
  })
})
