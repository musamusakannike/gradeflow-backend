import Fee from "../models/feeModel.js"
import Student from "../models/studentModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"
import { sendNotificationToParents } from "../utils/notificationService.js"
import Term from "../models/termModel.js"

// @desc    Get all fees for a term
// @route   GET /api/fees/term/:termId
// @access  Private/SchoolAdmin/Bursar
export const getFeesByTerm = asyncHandler(async (req, res, next) => {
  const fees = await Fee.find({ term: req.params.termId })
    .populate({
      path: "student",
      select: "studentId",
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    })
    .populate("term", "name")

  res.status(200).json({
    success: true,
    count: fees.length,
    data: fees,
  })
})

// @desc    Get all fees for a student
// @route   GET /api/fees/student/:studentId
// @access  Private/SchoolAdmin/Bursar/Student
export const getFeesByStudent = asyncHandler(async (req, res, next) => {
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
    return next(new AppError(`User ${req.user.id} is not authorized to access this student's fees`, 403))
  }

  const fees = await Fee.find({ student: req.params.studentId })
    .populate({
      path: "student",
      select: "studentId",
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    })
    .populate("term", "name")

  res.status(200).json({
    success: true,
    count: fees.length,
    data: fees,
  })
})

// @desc    Get single fee
// @route   GET /api/fees/:id
// @access  Private/SchoolAdmin/Bursar/Student
export const getFee = asyncHandler(async (req, res, next) => {
  const fee = await Fee.findById(req.params.id)
    .populate({
      path: "student",
      select: "studentId",
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    })
    .populate("term", "name")

  if (!fee) {
    return next(new AppError(`Fee not found with id of ${req.params.id}`, 404))
  }

  // Get student
  const student = await Student.findById(fee.student)

  // Make sure user belongs to school or is the student
  if (
    req.user.role !== ROLES.SUPER_ADMIN &&
    req.user.school.toString() !== fee.school.toString() &&
    req.user._id.toString() !== student.user.toString()
  ) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this fee`, 403))
  }

  res.status(200).json({
    success: true,
    data: fee,
  })
})

// @desc    Create new fee
// @route   POST /api/fees
// @access  Private/SchoolAdmin/Bursar
export const createFee = asyncHandler(async (req, res, next) => {
  // Add school to req.body
  req.body.school = req.user.school

  const fee = await Fee.create(req.body)

  res.status(201).json({
    success: true,
    data: fee,
  })
})

// @desc    Update fee
// @route   PUT /api/fees/:id
// @access  Private/SchoolAdmin/Bursar
export const updateFee = asyncHandler(async (req, res, next) => {
  let fee = await Fee.findById(req.params.id)

  if (!fee) {
    return next(new AppError(`Fee not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== fee.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this fee`, 403))
  }

  // Make sure user is bursar or school admin
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.SCHOOL_ADMIN && req.user.role !== ROLES.BURSAR) {
    return next(new AppError(`User ${req.user.id} is not authorized to update fees`, 403))
  }

  fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: fee,
  })
})

// @desc    Delete fee
// @route   DELETE /api/fees/:id
// @access  Private/SchoolAdmin/Bursar
export const deleteFee = asyncHandler(async (req, res, next) => {
  const fee = await Fee.findById(req.params.id)

  if (!fee) {
    return next(new AppError(`Fee not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== fee.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to delete this fee`, 403))
  }

  // Make sure user is bursar or school admin
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.SCHOOL_ADMIN && req.user.role !== ROLES.BURSAR) {
    return next(new AppError(`User ${req.user.id} is not authorized to delete fees`, 403))
  }

  await fee.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Update fee status
// @route   PUT /api/fees/:id/status
// @access  Private/SchoolAdmin/Bursar
export const updateFeeStatus = asyncHandler(async (req, res, next) => {
  let fee = await Fee.findById(req.params.id)

  if (!fee) {
    return next(new AppError(`Fee not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== fee.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this fee`, 403))
  }

  // Make sure user is bursar or school admin
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.SCHOOL_ADMIN && req.user.role !== ROLES.BURSAR) {
    return next(new AppError(`User ${req.user.id} is not authorized to update fee status`, 403))
  }

  fee = await Fee.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      paidAmount: req.body.paidAmount || fee.paidAmount,
      paymentDate: req.body.status === "Paid" ? Date.now() : fee.paymentDate,
      paymentMethod: req.body.paymentMethod || fee.paymentMethod,
      reference: req.body.reference || fee.reference,
    },
    {
      new: true,
      runValidators: true,
    },
  )

  // Send notification to parents when fee status changes
  const student = await Student.findById(fee.student).populate("user", "firstName lastName")
  const term = await Term.findById(fee.term).populate("academicSession", "name")

  if (student && term) {
    let title, message

    if (req.body.status === "Paid") {
      title = `Fee Payment Confirmed: ${student.user.firstName} ${student.user.lastName}`
      message = `The fee payment for ${term.name} (${term.academicSession?.name || ""}) has been confirmed. Amount: ${fee.paidAmount}`
    } else if (req.body.status === "Partial") {
      title = `Partial Fee Payment: ${student.user.firstName} ${student.user.lastName}`
      message = `A partial fee payment for ${term.name} (${term.academicSession?.name || ""}) has been recorded. Amount Paid: ${fee.paidAmount}, Remaining: ${fee.amount - fee.paidAmount}`
    } else {
      title = `Fee Status Update: ${student.user.firstName} ${student.user.lastName}`
      message = `The fee status for ${term.name} (${term.academicSession?.name || ""}) has been updated to ${req.body.status}.`
    }

    await sendNotificationToParents({
      studentId: fee.student,
      senderId: req.user._id,
      type: "fee",
      title,
      message,
      relatedId: fee._id,
      relatedModel: "Fee",
      schoolId: req.user.school,
      sendEmail: true, // Send email for fee notifications
    })
  }

  res.status(200).json({
    success: true,
    data: fee,
  })
})
