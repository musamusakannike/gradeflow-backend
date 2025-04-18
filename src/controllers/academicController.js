import AcademicSession from "../models/academicSessionModel.js"
import Term from "../models/termModel.js"
import asyncHandler from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"
import { ROLES } from "../config/roles.js"

// @desc    Get all academic sessions for a school
// @route   GET /api/academic/sessions/:schoolId
// @access  Private/SchoolAdmin
export const getAcademicSessions = asyncHandler(async (req, res, next) => {
  const sessions = await AcademicSession.find({ school: req.params.schoolId })

  res.status(200).json({
    success: true,
    count: sessions.length,
    data: sessions,
  })
})

// @desc    Get single academic session
// @route   GET /api/academic/sessions/:id
// @access  Private/SchoolAdmin
export const getAcademicSession = asyncHandler(async (req, res, next) => {
  const session = await AcademicSession.findById(req.params.id)

  if (!session) {
    return next(new AppError(`Session not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== session.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this session`, 403))
  }

  res.status(200).json({
    success: true,
    data: session,
  })
})

// @desc    Create new academic session
// @route   POST /api/academic/sessions
// @access  Private/SchoolAdmin
export const createAcademicSession = asyncHandler(async (req, res, next) => {
  // Add school to req.body
  req.body.school = req.user.school

  const session = await AcademicSession.create(req.body)

  // Create terms for the session
  const terms = [
    {
      name: "First Term",
      academicSession: session._id,
      startDate: req.body.startDate,
      endDate: new Date(new Date(req.body.startDate).setMonth(new Date(req.body.startDate).getMonth() + 3)),
      school: req.user.school,
    },
    {
      name: "Second Term",
      academicSession: session._id,
      startDate: new Date(new Date(req.body.startDate).setMonth(new Date(req.body.startDate).getMonth() + 4)),
      endDate: new Date(new Date(req.body.startDate).setMonth(new Date(req.body.startDate).getMonth() + 7)),
      school: req.user.school,
    },
    {
      name: "Third Term",
      academicSession: session._id,
      startDate: new Date(new Date(req.body.startDate).setMonth(new Date(req.body.startDate).getMonth() + 8)),
      endDate: req.body.endDate,
      school: req.user.school,
    },
  ]

  await Term.insertMany(terms)

  res.status(201).json({
    success: true,
    data: session,
  })
})

// @desc    Update academic session
// @route   PUT /api/academic/sessions/:id
// @access  Private/SchoolAdmin
export const updateAcademicSession = asyncHandler(async (req, res, next) => {
  let session = await AcademicSession.findById(req.params.id)

  if (!session) {
    return next(new AppError(`Session not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== session.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this session`, 403))
  }

  session = await AcademicSession.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: session,
  })
})

// @desc    Delete academic session
// @route   DELETE /api/academic/sessions/:id
// @access  Private/SchoolAdmin
export const deleteAcademicSession = asyncHandler(async (req, res, next) => {
  const session = await AcademicSession.findById(req.params.id)

  if (!session) {
    return next(new AppError(`Session not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== session.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to delete this session`, 403))
  }

  // Delete all terms associated with this session
  await Term.deleteMany({ academicSession: session._id })

  await session.remove()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Get all terms for a session
// @route   GET /api/academic/terms/:sessionId
// @access  Private/SchoolAdmin
export const getTerms = asyncHandler(async (req, res, next) => {
  const terms = await Term.find({ academicSession: req.params.sessionId })

  res.status(200).json({
    success: true,
    count: terms.length,
    data: terms,
  })
})

// @desc    Get single term
// @route   GET /api/academic/terms/:id
// @access  Private/SchoolAdmin
export const getTerm = asyncHandler(async (req, res, next) => {
  const term = await Term.findById(req.params.id)

  if (!term) {
    return next(new AppError(`Term not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== term.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to access this term`, 403))
  }

  res.status(200).json({
    success: true,
    data: term,
  })
})

// @desc    Update term
// @route   PUT /api/academic/terms/:id
// @access  Private/SchoolAdmin
export const updateTerm = asyncHandler(async (req, res, next) => {
  let term = await Term.findById(req.params.id)

  if (!term) {
    return next(new AppError(`Term not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== term.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this term`, 403))
  }

  term = await Term.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: term,
  })
})

// @desc    Set active term
// @route   PUT /api/academic/terms/:id/activate
// @access  Private/SchoolAdmin
export const activateTerm = asyncHandler(async (req, res, next) => {
  let term = await Term.findById(req.params.id)

  if (!term) {
    return next(new AppError(`Term not found with id of ${req.params.id}`, 404))
  }

  // Make sure user belongs to school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.school.toString() !== term.school.toString()) {
    return next(new AppError(`User ${req.user.id} is not authorized to update this term`, 403))
  }

  // Deactivate all terms for this school
  await Term.updateMany({ school: term.school }, { isActive: false })

  // Activate this term
  term = await Term.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    {
      new: true,
      runValidators: true,
    },
  )

  res.status(200).json({
    success: true,
    data: term,
  })
})
